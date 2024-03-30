import { WalletContextState } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import { CONSTANT_BID_CAP } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  calculateCurrentInterestSolPure,
  optimisticBorrowUpdateBondingBondOffer,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2 } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, chunk, groupBy, sumBy, uniqueId } from 'lodash'
import moment from 'moment'
import { TxnExecutor } from 'solana-transactions-executor'

import { BorrowNft, Loan, Offer } from '@banx/api/core'
import bonkTokenImg from '@banx/assets/BonkToken.png'
import magicEdenLogoImg from '@banx/assets/MagicEdenLogo.png'
import { BONDS } from '@banx/constants'
import { LoansOptimisticStore, OffersOptimisticStore } from '@banx/store'
import { BorrowType, createWalletInstance, defaultTxnErrorHandler } from '@banx/transactions'
import {
  BORROW_NFT_PER_TXN,
  MakeBorrowActionParams,
  getNftBorrowType,
  makeBorrowAction,
} from '@banx/transactions/borrow'
import {
  convertOffersToSimple,
  destroySnackbar,
  enqueueSnackbar,
  enqueueTranactionsError,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  offerNeedsReservesOptimizationOnBorrow,
} from '@banx/utils'

import { CartState } from '../../cartState'
import { ONE_WEEK_IN_SECONDS } from './constants'
import { OfferWithLoanValue, TableNftData } from './types'

import styles from './BorrowTable.module.less'

export const createTableNftData = ({
  nfts,
  findOfferInCart,
  findBestOffer,
  maxLoanValueByMarket,
  maxBorrowPercent,
}: {
  nfts: BorrowNft[]
  findOfferInCart: CartState['findOfferInCart']
  findBestOffer: CartState['findBestOffer']
  maxLoanValueByMarket: Record<string, number>
  maxBorrowPercent: number
}) => {
  return nfts.map((nft) => {
    const offer = findOfferInCart({ mint: nft.mint })

    const maxloanValue =
      offer?.loanValue || findBestOffer({ marketPubkey: nft.loan.marketPubkey })?.loanValue || 0

    const loanValue = calcAdjustedLoanValueByMaxByMarket({
      loanValue: maxloanValue,
      maxLoanValueOnMarket: maxLoanValueByMarket[nft.loan.marketPubkey] || 0,
      maxBorrowPercent,
    })

    const selected = !!offer

    const interest = calcInterest({
      timeInterval: ONE_WEEK_IN_SECONDS,
      loanValue: loanValue,
      apr: nft.loan.marketApr,
    })

    return { mint: nft.mint, nft, loanValue, selected, interest }
  })
}

export const executeBorrow = async (props: {
  isLedger?: boolean
  txnParams: MakeBorrowActionParams[]
  wallet: WalletContextState
  connection: web3.Connection
  addLoansOptimistic: LoansOptimisticStore['add']
  updateOffersOptimistic: OffersOptimisticStore['update']
  onSuccessAll?: () => void
}) => {
  const {
    isLedger = false,
    txnParams,
    wallet,
    connection,
    addLoansOptimistic,
    updateOffersOptimistic,
    onSuccessAll,
  } = props

  const loadingSnackbarId = uniqueId()

  const txnsResults = await new TxnExecutor(
    makeBorrowAction,
    { wallet: createWalletInstance(wallet), connection },
    { signAllChunkSize: isLedger ? 1 : 40 },
  )
    .addTransactionParams(txnParams)
    .on('sentSome', () => {
      enqueueTransactionsSent()
      enqueueWaitingConfirmation(loadingSnackbarId)
    })
    .on('confirmedAll', (results) => {
      const { confirmed, failed } = results
      const failedTransactionsCount = failed.length

      destroySnackbar(loadingSnackbarId)

      if (failedTransactionsCount) {
        return enqueueTranactionsError(failedTransactionsCount)
      }

      if (confirmed.length) {
        enqueueSnackbar({ message: 'Borrowed successfully', type: 'success' })

        const loansFlat = confirmed
          .map(({ result }) => result?.map(({ loan }) => loan))
          .flat()
          .filter(Boolean) as Loan[]

        if (wallet.publicKey) {
          addLoansOptimistic(loansFlat, wallet.publicKey?.toBase58())
        }

        const optimisticOffers: OfferWithLoanValue[] = confirmed
          ?.map(
            (result) =>
              result.result?.map(({ offer, loan }) => ({
                offer,
                loanValue:
                  loan.bondTradeTransaction.solAmount + loan.bondTradeTransaction.feeAmount,
              })) || [],
          )
          .flat()
        const optimisticByPubkey = groupBy(optimisticOffers, ({ offer }) => offer.publicKey)
        const optimizeIntoReservesByOfferPubkey = chain(txnParams)
          .flatten()
          .map(({ offer, optimizeIntoReserves }) => [
            offer.publicKey,
            optimizeIntoReserves === undefined ? true : optimizeIntoReserves,
          ])
          .uniqBy(([publicKey]) => publicKey)
          .fromPairs()
          .value() as Record<string, boolean>

        const optimisticsToAdd = Object.entries(optimisticByPubkey).map(([offerPubkey, offers]) => {
          return mergeOffersWithLoanValue(offers, optimizeIntoReservesByOfferPubkey[offerPubkey])
        }) as Offer[]

        updateOffersOptimistic(optimisticsToAdd)

        onSuccessAll?.()
      }
    })
    .on('error', (error) => {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: txnParams,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'Borrow',
      })
    })
    .execute()

  return txnsResults
}

export const createBorrowParams = (nfts: TableNftData[], rawOffers: Record<string, Offer[]>) => {
  const nftsByMarket = groupBy(nfts, ({ nft }) => nft.loan.marketPubkey)

  const txnData = chain(nftsByMarket)
    .entries()
    //? Match nfts and offers to borrow from the most suitable offers
    .map(([marketPubkey, nfts]) => matchNftsAndOffers({ nfts, rawOffers: rawOffers[marketPubkey] }))
    .flatten()
    .value()

  return chunkBorrowIxnsParams(txnData)
}

type MatchNftsAndOffers = (props: {
  nfts: TableNftData[]
  rawOffers: Offer[]
}) => MakeBorrowActionParams
const matchNftsAndOffers: MatchNftsAndOffers = ({ nfts, rawOffers }) => {
  //? Create simple offers array sorted by loanValue (offerValue) asc
  const simpleOffers = convertOffersToSimple(rawOffers, 'asc')

  //? Generate MakeBorrowActionParams
  const ixnsParams = chain(nfts)
    .cloneDeep()
    //? Sort by selected loanValue asc
    .sort((a, b) => {
      return a.loanValue - b.loanValue
    })
    .reduce(
      (acc, nft) => {
        //? Find index of offer. OfferValue must be greater than or equal to selected loanValue. And mustn't be used by prev iteration
        const offerIndex = simpleOffers.findIndex(
          ({ loanValue: offerValue }, idx) => nft.loanValue <= offerValue && acc.offerIndex <= idx,
        )

        const ixnParams = {
          nft: nft.nft,
          loanValue: nft.loanValue,
          //? find normal offer using index
          offer: rawOffers.find(
            ({ publicKey }) => publicKey === simpleOffers[offerIndex].publicKey,
          ),
        }

        return {
          //? Increment offerIndex to use in next iteration (to reduce amount of iterations)
          offerIndex: offerIndex + 1,
          ixnParams: [...acc.ixnParams, ixnParams] as MakeBorrowActionParams,
        }
      },
      { offerIndex: 0, ixnParams: [] } as { offerIndex: number; ixnParams: MakeBorrowActionParams },
    )
    .value().ixnParams

  //? Calc total loanValue for every offer
  const loanValueSumByOffer = chain(ixnsParams)
    .groupBy(({ offer }) => offer.publicKey)
    .entries()
    .map(([offerPubkey, ixnParams]) => [
      offerPubkey,
      sumBy(ixnParams, ({ loanValue }) => loanValue),
    ])
    .fromPairs()
    .value() as Record<string, number>

  return ixnsParams.map(({ offer, ...restParams }) => ({
    ...restParams,
    offer,
    optimizeIntoReserves: offerNeedsReservesOptimizationOnBorrow(
      offer,
      loanValueSumByOffer[offer.publicKey],
    ),
  }))
}

const chunkBorrowIxnsParams = (borrowIxnParams: MakeBorrowActionParams) => {
  const ixnsByBorrowType = groupBy(borrowIxnParams, ({ nft }) => getNftBorrowType(nft))
  return Object.entries(ixnsByBorrowType)
    .map(([type, ixns]) => chunk(ixns, BORROW_NFT_PER_TXN[type as BorrowType]))
    .flat()
}

type CalcInterest = (props: { loanValue: number; timeInterval: number; apr: number }) => number
export const calcInterest: CalcInterest = ({ loanValue, timeInterval, apr }) => {
  const currentTimeUnix = moment().unix()

  return calculateCurrentInterestSolPure({
    loanValue,
    startTime: currentTimeUnix - timeInterval,
    currentTime: currentTimeUnix,
    rateBasePoints: apr + BONDS.PROTOCOL_REPAY_FEE,
  })
}

export const optimisticWithdrawFromBondOffer = (
  bondOffer: Offer,
  amountOfSolToWithdraw: number,
): Offer => {
  const newFundsSolOrTokenBalance = bondOffer.fundsSolOrTokenBalance - amountOfSolToWithdraw
  return {
    ...bondOffer,
    fundsSolOrTokenBalance: newFundsSolOrTokenBalance,
    edgeSettlement: newFundsSolOrTokenBalance,
    bidSettlement: CONSTANT_BID_CAP * -1 + newFundsSolOrTokenBalance,
  }
}

const mergeOffersWithLoanValue = (
  offers: OfferWithLoanValue[],
  optimizeIntoReserves = true,
): Offer | null => {
  const { offer } = offers.reduce((acc, offer) => {
    return {
      offer: optimisticBorrowUpdateBondingBondOffer(
        acc.offer as BondOfferV2,
        offer.loanValue,
        optimizeIntoReserves,
      ),
      loanValue: 0,
    }
  })

  return offer
}

type CalcAdjustedLoanValueByMaxByMarket = (props: {
  loanValue: number
  maxLoanValueOnMarket: number
  maxBorrowPercent: number
}) => number
export const calcAdjustedLoanValueByMaxByMarket: CalcAdjustedLoanValueByMaxByMarket = ({
  loanValue,
  maxLoanValueOnMarket,
  maxBorrowPercent,
}) => {
  return Math.min(loanValue, maxLoanValueOnMarket * (maxBorrowPercent / 100)) || 0
}

export const showBonkRewardsSnack = () => {
  enqueueSnackbar({
    className: styles.bonkRewardsSnack,
    message: 'You got a 50% $BONK cashback claimable on the Rewards page!',
    icon: <img src={bonkTokenImg} alt="Bonk token" className={styles.bonkRewardsSnackIcon} />,
  })
}

export const showMagicEdenRewardsSnack = () => {
  enqueueSnackbar({
    className: styles.magicEdenRewardsSnack,
    closeIconClassName: styles.magicEdenCloseIcon,
    message: 'You just got 100% cashback for using Magic wallet! Check out Rewards page!',
    icon: (
      <img src={magicEdenLogoImg} alt="Magic Eden" className={styles.magicEdenRewardsSnackIcon} />
    ),
  })
}
