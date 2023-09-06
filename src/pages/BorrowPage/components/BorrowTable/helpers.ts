import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { chunk, groupBy } from 'lodash'
import moment from 'moment'

import { BorrowNft, Loan, Offer } from '@banx/api/core'
import { UseOptimisticLoansValues } from '@banx/store'
import { BorrowType, defaultTxnErrorHandler } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import {
  BORROW_NFT_PER_TXN,
  MakeBorrowActionParams,
  getNftBorrowType,
  makeBorrowAction,
} from '@banx/transactions/borrow'
import { WalletAndConnection } from '@banx/types'
import { enqueueSnackbar } from '@banx/utils'

import { CartState } from '../../cartState'
import { SimpleOffer } from '../../types'
import { ONE_WEEK_IN_SECONDS } from './constants'

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
      loanValue,
      apr: nft.loan.marketApr,
    })

    return { mint: nft.mint, nft, loanValue, selected, interest }
  })
}

export const executeBorrow = async (props: {
  isLedger?: boolean
  txnParams: MakeBorrowActionParams[]
  walletAndConnection: WalletAndConnection
  addLoansOptimistic: UseOptimisticLoansValues['add']
}) => {
  const { isLedger = false, txnParams, walletAndConnection, addLoansOptimistic } = props
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
          return result
        })
        .flat()
        .filter(Boolean) as Loan[]
      if (wallet.publicKey) {
        addLoansOptimistic(loansFlat, wallet.publicKey?.toBase58())
      }
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
