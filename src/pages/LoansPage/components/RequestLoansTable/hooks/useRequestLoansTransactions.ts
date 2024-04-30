import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Loan } from '@banx/api/core'
import { TXN_EXECUTOR_CONFIRM_OPTIONS } from '@banx/constants'
import { useLoansRequestsOptimistic, usePriorityFees } from '@banx/store'
import { createWalletInstance, defaultTxnErrorHandler } from '@banx/transactions'
import { makeDelistAction } from '@banx/transactions/loans'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
} from '@banx/utils'

import { useSelectedLoans } from '../loansState'

export const useRequestLoansTransactions = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { priorityLevel } = usePriorityFees()

  const { update: updateLoansOptimistic } = useLoansRequestsOptimistic()
  const { selection, clear: clearSelection } = useSelectedLoans()

  const delist = async (loan: Loan) => {
    const loadingSnackbarId = uniqueId()

    const txnParam = { loan, priorityFeeLevel: priorityLevel }

    await new TxnExecutor(
      makeDelistAction,
      { wallet: createWalletInstance(wallet), connection },
      { confirmOptions: TXN_EXECUTOR_CONFIRM_OPTIONS },
    )
      .addTransactionParam(txnParam)
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
          if (result && wallet.publicKey) {
            enqueueSnackbar({
              message: 'Delist successfully',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            updateLoansOptimistic([result], wallet.publicKey.toBase58())
            clearSelection()
          }
        })
      })
      .on('error', (error) => {
        destroySnackbar(loadingSnackbarId)
        defaultTxnErrorHandler(error, {
          additionalData: loan,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Delist',
        })
      })
      .execute()
  }

  const delistAll = async () => {
    const loadingSnackbarId = uniqueId()

    const txnParams = selection.map(({ loan }) => ({
      loan,
      priorityFeeLevel: priorityLevel,
    }))

    await new TxnExecutor(
      makeDelistAction,
      { wallet: createWalletInstance(wallet), connection },
      { confirmOptions: TXN_EXECUTOR_CONFIRM_OPTIONS },
    )
      .addTransactionParams(txnParams)
      .on('sentAll', () => {
        enqueueTransactionsSent()
        enqueueWaitingConfirmation(loadingSnackbarId)
      })
      .on('confirmedAll', (results) => {
        const { confirmed, failed } = results

        destroySnackbar(loadingSnackbarId)

        if (confirmed.length) {
          enqueueSnackbar({ message: 'Loans delisted successfully', type: 'success' })

          confirmed.forEach(({ result }) => {
            if (result && wallet.publicKey) {
              updateLoansOptimistic([result], wallet.publicKey.toBase58())
            }
          })

          clearSelection()
        }

        if (failed.length) {
          return failed.forEach(({ signature, reason }) =>
            enqueueConfirmationError(signature, reason),
          )
        }
      })
      .on('error', (error) => {
        destroySnackbar(loadingSnackbarId)
        defaultTxnErrorHandler(error, {
          additionalData: selection,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'DelistBulk',
        })
      })
      .execute()
  }

  return {
    delist,
    delistAll,
  }
}
