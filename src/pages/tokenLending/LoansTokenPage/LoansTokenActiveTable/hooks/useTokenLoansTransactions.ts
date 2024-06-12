import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { every, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { core } from '@banx/api/tokens'
import { useIsLedger, useModal } from '@banx/store/common'
import { useTokenLoansOptimistic } from '@banx/store/token'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import {
  createRepayPartialTokenLoanTxnData,
  createRepayTokenLoanTxnData,
} from '@banx/transactions/tokenLending'
import {
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionSent,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  isTokenLoanRepaymentCallActive,
} from '@banx/utils'

import { caclFractionToRepay, caclFractionToRepayForRepaymentCall } from '../helpers'
import { useSelectedTokenLoans } from '../loansState'

export const useTokenLoansTransactions = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { isLedger } = useIsLedger()

  const { close } = useModal()

  const { update: updateLoansOptimistic } = useTokenLoansOptimistic()
  const { selection, clear: clearSelection } = useSelectedTokenLoans()

  const repayLoan = async (loan: core.TokenLoan) => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await createRepayTokenLoanTxnData({ loan, walletAndConnection })

      await new TxnExecutor<core.TokenLoan>(walletAndConnection, TXN_EXECUTOR_DEFAULT_OPTIONS)
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
        transactionName: 'RepayTokenLoan',
      })
    }
  }

  const repayAllLoans = async () => {
    const loadingSnackbarId = uniqueId()

    const selectedLoans = selection.map((loan) => loan.loan)

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        selectedLoans.map((loan) => createRepayTokenLoanTxnData({ loan, walletAndConnection })),
      )

      await new TxnExecutor<core.TokenLoan>(walletAndConnection, {
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
        transactionName: 'RepayAllTokenLoans',
      })
    }
  }

  const repayPartialLoan = async (loan: core.TokenLoan, fractionToRepay: number) => {
    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnData = await createRepayPartialTokenLoanTxnData({
        loan,
        fractionToRepay,
        walletAndConnection,
      })

      await new TxnExecutor<core.TokenLoan>(walletAndConnection, TXN_EXECUTOR_DEFAULT_OPTIONS)
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
        additionalData: loan,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'RepayPartialTokenLoan',
      })
    }
  }

  const repayUnpaidLoansInterest = async () => {
    const loadingSnackbarId = uniqueId()

    const loansWithCalculatedUnpaidInterest = selection
      .map(({ loan }) => ({
        loan,
        fractionToRepay: isTokenLoanRepaymentCallActive(loan)
          ? caclFractionToRepayForRepaymentCall(loan)
          : caclFractionToRepay(loan),
      }))
      .filter(({ fractionToRepay }) => fractionToRepay >= 1)

    const allLoansAreWithoutRepaymentCall = every(
      selection,
      ({ loan }) => !isTokenLoanRepaymentCallActive(loan),
    )

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        loansWithCalculatedUnpaidInterest.map(({ loan, fractionToRepay }) =>
          createRepayPartialTokenLoanTxnData({
            loan,
            fractionToRepay,
            walletAndConnection,
          }),
        ),
      )

      await new TxnExecutor<core.TokenLoan>(walletAndConnection, {
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
        transactionName: 'RepayUnpaidTokenLoansInterest',
      })
    }
  }

  return {
    repayLoan,
    repayAllLoans,
    repayPartialLoan,
    repayUnpaidLoansInterest,
  }
}
