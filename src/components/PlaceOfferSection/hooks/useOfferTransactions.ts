import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BondOfferOptimistic } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { core } from '@banx/api/nft'
import { useNftTokenType } from '@banx/store/nft'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  createMakeBondingOfferTxnData,
  createRemoveOfferTxnData,
  createUpdateBondingOfferTxnData,
} from '@banx/transactions/nftLending'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
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
  optimisticOffer?: core.Offer
  updateOrAddOffer: (offer: core.Offer) => void
  resetFormValues: () => void
  exitEditMode: () => void
}) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { tokenType } = useNftTokenType()

  const onCreateOffer = async () => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createMakeBondingOfferTxnData({
        marketPubkey,
        loansAmount,
        loanValue,
        deltaValue,
        tokenType,
        walletAndConnection,
      })

      //TODO: Fix genric here
      await new TxnExecutor<BondOfferOptimistic>(walletAndConnection, TXN_EXECUTOR_DEFAULT_OPTIONS)
        .addTxnData(txnData)
        .on('sentSome', (results) => {
          results.forEach(({ signature }) => enqueueTransactionSent(signature))
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          if (failed.length) {
            return failed.forEach(({ signature, reason }) =>
              enqueueConfirmationError(signature, reason),
            )
          }

          return confirmed.forEach(({ result, signature }) => {
            if (result) {
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
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: {
          marketPubkey,
          loansAmount,
          loanValue,
          deltaValue,
          tokenType,
        },
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'CreateOffer',
      })
    }
  }

  const onUpdateOffer = async () => {
    if (!optimisticOffer) return

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createUpdateBondingOfferTxnData({
        loanValue,
        offer: optimisticOffer,
        loansAmount,
        deltaValue,
        tokenType,
        walletAndConnection,
      })

      //TODO: Fix genric here
      await new TxnExecutor<BondOfferOptimistic>(walletAndConnection, TXN_EXECUTOR_DEFAULT_OPTIONS)
        .addTxnData(txnData)
        .on('sentSome', (results) => {
          results.forEach(({ signature }) => enqueueTransactionSent(signature))
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          if (failed.length) {
            return failed.forEach(({ signature, reason }) =>
              enqueueConfirmationError(signature, reason),
            )
          }

          return confirmed.forEach(({ result, signature }) => {
            if (result) {
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
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: {
          loanValue,
          offer: optimisticOffer,
          loansAmount,
          deltaValue,
          tokenType,
        },
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'UpdateOffer',
      })
    }
  }

  const onRemoveOffer = async () => {
    if (!optimisticOffer) return

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createRemoveOfferTxnData({
        offer: optimisticOffer,
        tokenType,
        walletAndConnection,
      })

      //TODO: Fix genric here
      await new TxnExecutor<BondOfferOptimistic>(walletAndConnection, TXN_EXECUTOR_DEFAULT_OPTIONS)
        .addTxnData(txnData)
        .on('sentSome', (results) => {
          results.forEach(({ signature }) => enqueueTransactionSent(signature))
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          if (failed.length) {
            return failed.forEach(({ signature, reason }) =>
              enqueueConfirmationError(signature, reason),
            )
          }

          return confirmed.forEach(({ result, signature }) => {
            if (result) {
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
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: { offer: optimisticOffer, tokenType },
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'RemoveOffer',
      })
    }
  }

  return {
    onCreateOffer,
    onUpdateOffer,
    onRemoveOffer,
  }
}
