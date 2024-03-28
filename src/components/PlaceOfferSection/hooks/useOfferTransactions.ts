import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { TxnExecutor } from 'solana-transactions-executor'

import { Offer } from '@banx/api/core'
import { createWalletInstance, defaultTxnErrorHandler } from '@banx/transactions'
import {
  makeCreateBondingOfferAction,
  makeRemoveOfferAction,
  makeUpdateBondingOfferAction,
} from '@banx/transactions/bonds'
import {
  createSnackbarState,
  destroySnackbar,
  enqueueSnackbar,
  enqueueTranactionError,
  enqueueTransactionSent,
  enqueueWaitingConfirmation,
} from '@banx/utils'

export const useOfferTransactions = ({
  marketPubkey,
  loansAmount,
  loanValue,
  deltaValue,
  optimisticOffer,
  updateOrAddOffer,
  resetFormValues,
  exitEditMode,
}: {
  marketPubkey: string
  loansAmount: number
  loanValue: number
  deltaValue: number
  optimisticOffer?: Offer
  updateOrAddOffer: (offer: Offer) => void
  resetFormValues: () => void
  exitEditMode: () => void
}) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const onCreateOffer = async () => {
    const loadingSnackbarState = createSnackbarState()

    const txnParam = { marketPubkey, loansAmount, loanValue, deltaValue }

    await new TxnExecutor(makeCreateBondingOfferAction, {
      wallet: createWalletInstance(wallet),
      connection,
    })
      .addTransactionParam(txnParam)
      .on('sentSome', (results) => {
        results.forEach(({ signature }) => enqueueTransactionSent(signature))
        loadingSnackbarState.id = enqueueWaitingConfirmation()
      })
      .on('confirmedAll', (results) => {
        const { confirmed, failed } = results

        if (failed.length) {
          destroySnackbar(loadingSnackbarState.id)
          return enqueueTranactionError()
        }

        return confirmed.forEach(({ result, signature }) => {
          if (result) {
            destroySnackbar(loadingSnackbarState.id)
            enqueueSnackbar({
              message: 'Offer successfully placed',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            updateOrAddOffer(result.bondOffer)
            resetFormValues()
          }
        })
      })
      .on('error', (error) => {
        destroySnackbar(loadingSnackbarState.id)
        defaultTxnErrorHandler(error, {
          additionalData: txnParam,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'CreateOffer',
        })
      })
      .execute()
  }

  const onUpdateOffer = async () => {
    if (!optimisticOffer) return

    const loadingSnackbarState = createSnackbarState()

    const txnParam = { loanValue, optimisticOffer, loansAmount, deltaValue }

    await new TxnExecutor(makeUpdateBondingOfferAction, {
      wallet: createWalletInstance(wallet),
      connection,
    })
      .addTransactionParam(txnParam)
      .on('sentSome', (results) => {
        results.forEach(({ signature }) => enqueueTransactionSent(signature))
        loadingSnackbarState.id = enqueueWaitingConfirmation()
      })
      .on('confirmedAll', (results) => {
        const { confirmed, failed } = results

        if (failed.length) {
          destroySnackbar(loadingSnackbarState.id)
          return enqueueTranactionError()
        }

        return confirmed.forEach(({ result, signature }) => {
          if (result) {
            destroySnackbar(loadingSnackbarState.id)
            enqueueSnackbar({
              message: 'Changes successfully applied',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            updateOrAddOffer(result.bondOffer)
          }
        })
      })
      .on('error', (error) => {
        destroySnackbar(loadingSnackbarState.id)
        defaultTxnErrorHandler(error, {
          additionalData: txnParam,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'UpdateOffer',
        })
      })
      .execute()
  }

  const onRemoveOffer = () => {
    if (!optimisticOffer) return

    const loadingSnackbarState = createSnackbarState()

    new TxnExecutor(makeRemoveOfferAction, { wallet: createWalletInstance(wallet), connection })
      .addTransactionParam({ optimisticOffer })

      .on('sentSome', (results) => {
        results.forEach(({ signature }) => enqueueTransactionSent(signature))
        loadingSnackbarState.id = enqueueWaitingConfirmation()
      })
      .on('confirmedAll', (results) => {
        const { confirmed, failed } = results

        if (failed.length) {
          destroySnackbar(loadingSnackbarState.id)
          return enqueueTranactionError()
        }

        return confirmed.forEach(({ result, signature }) => {
          if (result) {
            destroySnackbar(loadingSnackbarState.id)
            enqueueSnackbar({
              message: 'Offer successfully removed',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            updateOrAddOffer(result.bondOffer)
            exitEditMode()
          }
        })
      })
      .on('error', (error) => {
        destroySnackbar(loadingSnackbarState.id)
        defaultTxnErrorHandler(error, {
          additionalData: optimisticOffer,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'RemoveOffer',
        })
      })
      .execute()
  }

  return {
    onCreateOffer,
    onUpdateOffer,
    onRemoveOffer,
  }
}
