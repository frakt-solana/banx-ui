import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { every, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { core } from '@banx/api/nft'
import { useIsLedger, useLoansOptimistic, useModal, usePriorityFees } from '@banx/store'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import { createRepayLoanTxnData, createRepayPartialLoanTxnData } from '@banx/transactions/loans'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  isLoanRepaymentCallActive,
} from '@banx/utils'

import { caclFractionToRepay, caclFractionToRepayForRepaymentCall } from '../helpers'
import { useSelectedLoans } from '../loansState'

export const useLoansTransactions = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { isLedger } = useIsLedger()
  const { priorityLevel } = usePriorityFees()

  const { close } = useModal()

  const { update: updateLoansOptimistic } = useLoansOptimistic()
  const { selection, clear: clearSelection } = useSelectedLoans()

  const repayLoan = async (loan: core.Loan) => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await createRepayLoanTxnData({ loan, walletAndConnection })

      await new TxnExecutor<core.Loan>(walletAndConnection, TXN_EXECUTOR_DEFAULT_OPTIONS)
        .addTxnData(txnsData)
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

              updateLoansOptimistic([result], wallet.publicKey.toBase58())
              clearSelection()
              close()
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
        additionalData: loan,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'Repay',
      })
    }
  }

  const repayPartialLoan = async (loan: core.Loan, fractionToRepay: number) => {
    const loadingSnackbarId = uniqueId()

    const txnParam = { loan, fractionToRepay, priorityFeeLevel: priorityLevel }

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createRepayPartialLoanTxnData({
        loan,
        fractionToRepay,
        walletAndConnection,
      })

      await new TxnExecutor<core.Loan>(walletAndConnection, TXN_EXECUTOR_DEFAULT_OPTIONS)
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
            if (result && wallet.publicKey) {
              enqueueSnackbar({
                message: 'Paid successfully',
                type: 'success',
                solanaExplorerPath: `tx/${signature}`,
              })

              updateLoansOptimistic([result], wallet.publicKey.toBase58())
              clearSelection()
              close()
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
        additionalData: txnParam,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'RepayPartial',
      })
    }
  }

  const repayBulkLoan = async () => {
    const loadingSnackbarId = uniqueId()

    const selectedLoans = selection.map((loan) => loan.loan)

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        selectedLoans.map((loan) =>
          createRepayLoanTxnData({
            loan,
            walletAndConnection,
          }),
        ),
      )

      await new TxnExecutor<core.Loan>(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
        chunkSize: isLedger ? 1 : 40,
      })
        .addTxnsData(txnsData)
        .on('sentAll', () => {
          enqueueTransactionsSent()
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          if (confirmed.length) {
            enqueueSnackbar({ message: 'Loans successfully repaid', type: 'success' })

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
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: selectedLoans,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'RepayBulk',
      })
    }
  }

  const repayUnpaidLoansInterest = async () => {
    const loadingSnackbarId = uniqueId()

    const loansWithCalculatedUnpaidInterest = selection
      .map(({ loan }) => ({
        loan,
        fractionToRepay: isLoanRepaymentCallActive(loan)
          ? caclFractionToRepayForRepaymentCall(loan)
          : caclFractionToRepay(loan),
      }))
      .filter(({ fractionToRepay }) => fractionToRepay >= 1)

    const allLoansAreWithoutRepaymentCall = every(
      selection,
      ({ loan }) => !isLoanRepaymentCallActive(loan),
    )

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        loansWithCalculatedUnpaidInterest.map(({ loan, fractionToRepay }) =>
          createRepayPartialLoanTxnData({
            loan,
            fractionToRepay,
            walletAndConnection,
          }),
        ),
      )

      await new TxnExecutor<core.Loan>(walletAndConnection, {
        ...TXN_EXECUTOR_DEFAULT_OPTIONS,
        chunkSize: isLedger ? 5 : 40,
      })
        .addTxnsData(txnsData)
        .on('sentAll', () => {
          enqueueTransactionsSent()
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          if (confirmed.length) {
            const message = allLoansAreWithoutRepaymentCall
              ? 'Loans interest successfully paid'
              : 'Paid successfully'

            enqueueSnackbar({ message, type: 'success' })

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
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: loansWithCalculatedUnpaidInterest,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'RepayUnpaidLoansInterest',
      })
    }
  }

  return {
    repayLoan,
    repayBulkLoan,
    repayPartialLoan,
    repayUnpaidLoansInterest,
  }
}
