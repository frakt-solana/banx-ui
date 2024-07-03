import { WalletContextState } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, groupBy, sumBy, uniqueId } from 'lodash'

import { TxnExecutor } from 'solana-transactions-executor'
import { core } from '@banx/api/nft'
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
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  matchNftsAndOffers,
  offerNeedsReservesOptimizationOnBorrow,
} from '@banx/utils'

import { TableNftData } from './types'

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
        createBorrowTxnData(
          {
            loanValue,
            nft,
            offer,
            optimizeIntoReserves,
            tokenType,
          },
          walletAndConnection,
        ),
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

          //? Add optimistic loans
          if (wallet.publicKey) {
            addLoansOptimistic(
              chain(loanAndOfferArray)
                .compact()
                .map(({ loan }) => loan)
                .value(),
              wallet.publicKey.toBase58(),
            )
          }

          //? Add optimistic offers
          updateOffersOptimistic(
            chain(loanAndOfferArray)
              .compact()
              .map(({ offer }) => offer)
              .value(),
          )

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
      .map(([marketPubkey, nfts]) => {
        const nftWithOffer = matchNftsAndOffers({ nfts, rawOffers: rawOffers[marketPubkey] })

        const txnsParams: CreateBorrowTxnDataParams[] = nftWithOffer.map(({ nft, offer }) => ({
          nft: nft.nft,
          loanValue: nft.loanValue,
          offer,
          tokenType,
          optimizeIntoReserves: true, //? Set optimizeIntoReserves to true by default
        }))

        //? Calc total loanValue for every offer
        const loanValueSumByOffer: Record<string, number> = chain(nftWithOffer)
          .groupBy(({ offer }) => offer.publicKey)
          .entries()
          .map(([offerPubkey, ixnParams]) => [
            offerPubkey,
            sumBy(ixnParams, ({ nft }) => nft.loanValue),
          ])
          .fromPairs()
          .value()

        return txnsParams.map(({ offer, ...restParams }) => ({
          ...restParams,
          offer,
          optimizeIntoReserves: offerNeedsReservesOptimizationOnBorrow(
            offer,
            loanValueSumByOffer[offer.publicKey],
          ),
        }))
      })
      .flatten()
      .value()
  )
}
