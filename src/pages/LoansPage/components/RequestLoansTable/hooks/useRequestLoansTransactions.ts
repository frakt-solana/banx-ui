import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Loan } from '@banx/api/core'
import { TXN_EXECUTOR_CONFIRM_OPTIONS } from '@banx/constants'
import { useLoansOptimistic, usePriorityFees } from '@banx/store'
import { createWalletInstance, defaultTxnErrorHandler } from '@banx/transactions'
import { makeRepayLoansAction } from '@banx/transactions/loans'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueWaitingConfirmation,
} from '@banx/utils'

import { useSelectedLoans } from '../loansState'

export const useRequestLoansTransactions = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { priorityLevel } = usePriorityFees()

  const { update: updateLoansOptimistic } = useLoansOptimistic()
  const { clear: clearSelection } = useSelectedLoans()

  const delistLoan = async (loan: Loan) => {
    const loadingSnackbarId = uniqueId()

    const txnParam = { loans: [loan], priorityFeeLevel: priorityLevel }

    await new TxnExecutor(
      makeRepayLoansAction,
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
              message: 'Repaid successfully',
              type: 'success',
              solanaExplorerPath: `tx/${signature}`,
            })

            updateLoansOptimistic(result, wallet.publicKey.toBase58())
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

  return {
    delistLoan,
  }
}
