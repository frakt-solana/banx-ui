import { CONSTANT_BID_CAP } from 'fbonds-core/lib/fbond-protocol/constants'
import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { chunk, cloneDeep, first, groupBy } from 'lodash'
import moment from 'moment'

import { BorrowNft, Loan, Offer } from '@banx/api/core'
import { LoansOptimisticStore, OffersOptimisticStore } from '@banx/store'
import { BorrowType, defaultTxnErrorHandler } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import {
  BORROW_NFT_PER_TXN,
  MakeBorrowActionParams,
  getNftBorrowType,
  makeBorrowAction,
} from '@banx/transactions/borrow'
import { WalletAndConnection } from '@banx/types'
import { calcLoanValueWithProtocolFee, enqueueSnackbar } from '@banx/utils'

import { CartState } from '../../cartState'
import { SimpleOffer } from '../../types'
import { ONE_WEEK_IN_SECONDS } from './constants'
import { OfferWithLoanValue } from './types'

export const createTableNftData = ({
  nfts,
  findOfferInCart,
  findBestOffer,
}: {
  nfts: BorrowNft[]
  findOfferInCart: CartState['findOfferInCart']
  findBestOffer: CartState['findBestOffer']
}) => {
  return nfts.map((nft) => {
    const offer = findOfferInCart({ mint: nft.mint })

    const loanValue =
      offer?.loanValue || findBestOffer({ marketPubkey: nft.loan.marketPubkey })?.loanValue || 0

    const selected = !!offer

    const interest = calcInterest({
      timeInterval: ONE_WEEK_IN_SECONDS,
      loanValue: calcLoanValueWithProtocolFee(loanValue),
      apr: nft.loan.marketApr,
    })

    return { mint: nft.mint, nft, loanValue, selected, interest }
  })
}

export const executeBorrow = async (props: {
  isLedger?: boolean
  txnParams: MakeBorrowActionParams[]
  walletAndConnection: WalletAndConnection
  addLoansOptimistic: LoansOptimisticStore['add']
  updateOffersOptimistic: OffersOptimisticStore['update']
}) => {
  const {
    isLedger = false,
    txnParams,
    walletAndConnection,
    addLoansOptimistic,
    updateOffersOptimistic,
  } = props
  const { wallet, connection } = walletAndConnection

  const txnsResults = await new TxnExecutor(
    makeBorrowAction,
    { wallet, connection },
    { signAllChunks: isLedger ? 1 : 40, rejectQueueOnFirstPfError: isLedger },
  )
    .addTxnParams(txnParams)
    .on('pfSuccessEach', (results) => {
      const loansFlat = results
        .map(({ txnHash, result }) => {
          enqueueSnackbar({
            message: 'Transaction Executed',
            solanaExplorerPath: `tx/${txnHash}`,
          })
          return result?.map(({ loan }) => loan)
        })
        .flat()
        .filter(Boolean) as Loan[]
      if (wallet.publicKey) {
        addLoansOptimistic(loansFlat, wallet.publicKey?.toBase58())
      }
    })
    .on('pfSuccessAll', (results) => {
      const optimisticOffers: OfferWithLoanValue[] = results
        ?.map(
          (result) =>
            result.result?.map(({ offer, loan }) => ({
              offer,
              loanValue: loan.bondTradeTransaction.solAmount + loan.bondTradeTransaction.feeAmount,
            })) || [],
        )
        .flat()

      const optimisticByPubkey = groupBy(optimisticOffers, ({ offer }) => offer.publicKey)

      const optimisticsToAdd = Object.values(optimisticByPubkey).map((offers) => {
        return mergeOffersWithLoanValue(offers)
      }) as Offer[]

      updateOffersOptimistic(optimisticsToAdd)
    })
    .on('pfError', (error) => {
      defaultTxnErrorHandler(error)
    })
    .execute()

  return txnsResults
}

export const createBorrowAllParams = (
  offerByMint: Record<string, SimpleOffer>,
  nfts: BorrowNft[],
  rawOffers: Record<string, Offer[]>,
) => {
  const borrowIxnParams = Object.entries(offerByMint)
    .map(([mint, sOffer]) => {
      const nft = nfts.find(({ nft }) => nft.mint === mint)
      const marketPubkey = nft?.loan.marketPubkey || ''
      const offer = rawOffers[marketPubkey].find(({ publicKey }) => publicKey === sOffer?.publicKey)

      if (!nft || !offer) return null

      return {
        nft: nft as BorrowNft,
        loanValue: sOffer.loanValue,
        offer: offer as Offer,
      }
    })
    .filter(Boolean) as MakeBorrowActionParams

  return chunkBorrowIxnsParams(borrowIxnParams)
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
    rateBasePoints: apr,
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

const mergeOffersWithLoanValue = (offers: OfferWithLoanValue[]): Offer | null => {
  const offer = cloneDeep(first(offers))
  if (!offer) return null
  const totalLoanValues = (offers.length - 1) * (offer?.loanValue || 0)

  return optimisticWithdrawFromBondOffer(offer.offer, totalLoanValues)
}
