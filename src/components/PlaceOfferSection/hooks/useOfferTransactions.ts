import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { uniqueId } from 'lodash'

import { TxnExecutor } from '@banx/../../solana-txn-executor/src'
import { core } from '@banx/api/nft'
import { useTokenType } from '@banx/store/nft'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  CreateMakeBondingOfferTxnDataParams,
  CreateRemoveOfferTxnDataParams,
  CreateUpdateBondingOfferTxnDataParams,
  createMakeBondingOfferTxnData,
  createRemoveOfferTxnData,
  createUpdateBondingOfferTxnData,
  parseMakeOfferSimulatedAccounts,
  parseRemoveOfferSimulatedAccounts,
  parseUpdateOfferSimulatedAccounts,
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
  const { tokenType } = useTokenType()

  const onCreateOffer = async () => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createMakeBondingOfferTxnData(
        {
          marketPubkey,
          loansAmount,
          loanValue,
          deltaValue,
          tokenType,
        },
        walletAndConnection,
      )

      //TODO: Fix genric here
      await new TxnExecutor<CreateMakeBondingOfferTxnDataParams>(
        walletAndConnection,
        TXN_EXECUTOR_DEFAULT_OPTIONS,
      )
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

          return confirmed.forEach(({ accountInfoByPubkey, signature }) => {
            enqueueSnackbar({
              message: 'Offer successfully placed',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            if (accountInfoByPubkey) {
              const offer = parseMakeOfferSimulatedAccounts(accountInfoByPubkey)
              updateOrAddOffer(offer)
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

      const txnData = await createUpdateBondingOfferTxnData(
        { loanValue, offer: optimisticOffer, loansAmount, deltaValue, tokenType },
        walletAndConnection,
      )

      //TODO: Fix genric here
      await new TxnExecutor<CreateUpdateBondingOfferTxnDataParams>(
        walletAndConnection,
        TXN_EXECUTOR_DEFAULT_OPTIONS,
      )
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

          return confirmed.forEach(({ accountInfoByPubkey, signature }) => {
            enqueueSnackbar({
              message: 'Changes successfully applied',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })
            if (accountInfoByPubkey) {
              const offer = parseUpdateOfferSimulatedAccounts(accountInfoByPubkey)
              updateOrAddOffer(offer)
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

      const txnData = await createRemoveOfferTxnData(
        { offer: optimisticOffer, tokenType },
        walletAndConnection,
      )

      //TODO: Fix genric here
      await new TxnExecutor<CreateRemoveOfferTxnDataParams>(
        walletAndConnection,
        TXN_EXECUTOR_DEFAULT_OPTIONS,
      )
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

          return confirmed.forEach(({ accountInfoByPubkey, signature }) => {
            enqueueSnackbar({
              message: 'Offer successfully removed',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            if (accountInfoByPubkey) {
              const offer = parseRemoveOfferSimulatedAccounts(accountInfoByPubkey)

              updateOrAddOffer(offer)
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
