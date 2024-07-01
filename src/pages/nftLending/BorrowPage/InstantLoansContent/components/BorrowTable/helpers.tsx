import { WalletContextState } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import {
  calculateCurrentInterestSolPure,
  optimisticBorrowUpdateBondingBondOffer,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { Dictionary, chain, groupBy, sumBy, uniqueId } from 'lodash'
import moment from 'moment'

import { TxnExecutor } from '@banx/../../solana-txn-executor/src'
import { core } from '@banx/api/nft'
import bonkTokenImg from '@banx/assets/BonkToken.png'
import { BONDS, ONE_WEEK_IN_SECONDS } from '@banx/constants'
import { LoansOptimisticStore, OffersOptimisticStore } from '@banx/store/nft'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateBorrowTxnDataParams,
  createBorrowTxnData,
  parseBorrowSimulatedAccounts,
} from '@banx/transactions/nftLending'
import {
  convertOffersToSimple,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  offerNeedsReservesOptimizationOnBorrow,
} from '@banx/utils'

import { CartState } from '../../cartState'
import { OfferWithLoanValue, TableNftData } from './types'

import styles from './BorrowTable.module.less'

export const createTableNftData = ({
  nfts,
  findOfferInCart,
  findBestOffer,
  maxLoanValueByMarket,
  maxBorrowPercent,
}: {
  nfts: core.BorrowNft[]
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
  createTxnsDataParams: CreateBorrowTxnDataParams[]
  wallet: WalletContextState
  connection: web3.Connection
  addLoansOptimistic: LoansOptimisticStore['add']
  updateOffersOptimistic: OffersOptimisticStore['update']
  onSuccessAll?: () => void
  onBorrowSuccess?: (loansAmount: number) => void
}) => {
  const {
    isLedger = false,
    createTxnsDataParams,
    wallet,
    connection,
    addLoansOptimistic,
    updateOffersOptimistic,
    onSuccessAll,
    onBorrowSuccess,
  } = props

  const loadingSnackbarId = uniqueId()

  try {
    const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

    const txnsData = await Promise.all(
      createTxnsDataParams.map(({ loanValue, nft, offer, optimizeIntoReserves, tokenType }) =>
        createBorrowTxnData({
          loanValue,
          nft,
          offer,
          optimizeIntoReserves,
          tokenType,
          walletAndConnection,
        }),
      ),
    )

    await new TxnExecutor<CreateBorrowTxnDataParams>(walletAndConnection, {
      ...TXN_EXECUTOR_DEFAULT_OPTIONS,
      chunkSize: isLedger ? 1 : 40,
    })
      .addTxnsData(txnsData)
      .on('sentSome', () => {
        enqueueTransactionsSent()
        enqueueWaitingConfirmation(loadingSnackbarId)
      })
      .on('confirmedAll', (results) => {
        const { confirmed, failed } = results

        destroySnackbar(loadingSnackbarId)

        if (confirmed.length) {
          enqueueSnackbar({ message: 'Borrowed successfully', type: 'success' })

          const loanAndOfferArray = confirmed.map((txnResult) => {
            const { accountInfoByPubkey, params } = txnResult

            if (!accountInfoByPubkey) return

            const { bondOffer, bondTradeTransaction, fraktBond } =
              parseBorrowSimulatedAccounts(accountInfoByPubkey)

            const loanAndOffer: { loan: core.Loan; offer: core.Offer } = {
              loan: {
                publicKey: fraktBond.publicKey,
                fraktBond: fraktBond,
                bondTradeTransaction: bondTradeTransaction,
                nft: params.nft.nft,
              },
              offer: bondOffer,
            }

            return loanAndOffer
          })

          if (wallet.publicKey) {
            addLoansOptimistic(
              chain(loanAndOfferArray)
                .compact()
                .map(({ loan }) => loan)
                .value(),
              wallet.publicKey?.toBase58(),
            )
          }

          const optimisticByPubkey: Dictionary<OfferWithLoanValue[]> = chain(loanAndOfferArray)
            .map((loanAndOffer) => {
              if (!loanAndOffer) return null
              const {
                offer,
                loan: {
                  bondTradeTransaction: { solAmount, feeAmount },
                },
              } = loanAndOffer

              const loanValue = solAmount + feeAmount

              return {
                offer,
                loanValue,
              }
            })
            .compact()
            .groupBy(({ offer }) => offer.publicKey)
            .value()

          const optimizeIntoReservesByOfferPubkey: Dictionary<boolean> = chain(createTxnsDataParams)
            .map(({ offer, optimizeIntoReserves }) => [
              offer.publicKey,
              optimizeIntoReserves === undefined ? true : optimizeIntoReserves,
            ])
            .uniqBy(([publicKey]) => publicKey)
            .fromPairs()
            .value()

          const optimisticsToAdd = chain(optimisticByPubkey)
            .entries()
            .map(([offerPubkey, offers]) => {
              return mergeOffersWithLoanValue(
                offers,
                optimizeIntoReservesByOfferPubkey[offerPubkey],
              )
            })
            .compact()
            .value()

          updateOffersOptimistic(optimisticsToAdd)

          onSuccessAll?.()
          onBorrowSuccess?.(loanAndOfferArray.length)
        }

        if (failed.length) {
          return failed.forEach(({ signature, reason }) =>
            enqueueConfirmationError(signature, reason),
          )
        }
      })
      .on('error', (error) => {
        throw error
      })
      .execute()
  } catch (error) {
    destroySnackbar(loadingSnackbarId)
    defaultTxnErrorHandler(error, {
      additionalData: createTxnsDataParams,
      walletPubkey: wallet?.publicKey?.toBase58(),
      transactionName: 'Borrow',
    })
  }
}

export const makeCreateTxnsDataParams = (
  nfts: TableNftData[],
  rawOffers: Record<string, core.Offer[]>,
  tokenType: LendingTokenType,
): CreateBorrowTxnDataParams[] => {
  const nftsByMarket = groupBy(nfts, ({ nft }) => nft.loan.marketPubkey)

  return (
    chain(nftsByMarket)
      .entries()
      //? Match nfts and offers to borrow from the most suitable offers
      .map(([marketPubkey, nfts]) =>
        matchNftsAndOffers({ nfts, rawOffers: rawOffers[marketPubkey], tokenType }),
      )
      .flatten()
      .value()
  )
}

const mergeOffersWithLoanValue = (
  offers: OfferWithLoanValue[],
  optimizeIntoReserves = true,
): core.Offer | null => {
  const { offer } = offers.reduce((acc, offer) => {
    return {
      offer: optimisticBorrowUpdateBondingBondOffer(
        acc.offer,
        offer.loanValue,
        optimizeIntoReserves,
      ),
      loanValue: 0,
    }
  })

  return offer
}

//TODO Simplity, refactor and move to utils
type MatchNftsAndOffers = (props: {
  nfts: TableNftData[]
  rawOffers: core.Offer[]
  tokenType: LendingTokenType
}) => CreateBorrowTxnDataParams[]
const matchNftsAndOffers: MatchNftsAndOffers = ({ nfts, rawOffers, tokenType }) => {
  //? Create simple offers array sorted by loanValue (offerValue) asc
  const simpleOffers = convertOffersToSimple(rawOffers, 'asc')

  //? Generate MakeBorrowActionParams
  const { txnsParams } = chain(nfts)
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

        const txnParams: CreateBorrowTxnDataParams = {
          nft: nft.nft,
          loanValue: nft.loanValue,
          //? find normal offer using index. Assume that offer always can be found
          offer: rawOffers.find(
            ({ publicKey }) => publicKey === simpleOffers[offerIndex].publicKey,
          ) as core.Offer,
          tokenType,
          optimizeIntoReserves: true, //? Set optimizeIntoReserves to true
        }

        return {
          //? Increment offerIndex to use in next iteration (to reduce amount of iterations)
          offerIndex: offerIndex + 1,
          txnsParams: [...acc.txnsParams, txnParams],
        }
      },
      { offerIndex: 0, txnsParams: [] } as {
        offerIndex: number
        txnsParams: CreateBorrowTxnDataParams[]
      },
    )
    .value()

  //? Calc total loanValue for every offer
  const loanValueSumByOffer = chain(txnsParams)
    .groupBy(({ offer }) => offer.publicKey)
    .entries()
    .map(([offerPubkey, ixnParams]) => [
      offerPubkey,
      sumBy(ixnParams, ({ loanValue }) => loanValue),
    ])
    .fromPairs()
    .value() as Record<string, number>

  return txnsParams.map(({ offer, ...restParams }) => ({
    ...restParams,
    offer,
    optimizeIntoReserves: offerNeedsReservesOptimizationOnBorrow(
      offer,
      loanValueSumByOffer[offer.publicKey],
    ),
  }))
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

type CalcAdjustedLoanValueByMaxByMarket = (props: {
  loanValue: number
  maxLoanValueOnMarket: number
  maxBorrowPercent: number
}) => number
const calcAdjustedLoanValueByMaxByMarket: CalcAdjustedLoanValueByMaxByMarket = ({
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
