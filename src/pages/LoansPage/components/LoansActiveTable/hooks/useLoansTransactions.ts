import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { chunk, groupBy, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Loan } from '@banx/api/core'
import { useSelectedLoans } from '@banx/pages/LoansPage/loansState'
import { useIsLedger, useLoansOptimistic } from '@banx/store'
import { BorrowType, createWalletInstance, defaultTxnErrorHandler } from '@banx/transactions'
import {
  REPAY_NFT_PER_TXN,
  getLoanBorrowType,
  makeRepayLoansAction,
  makeRepayPartialLoanAction,
} from '@banx/transactions/loans'
import {
  destroySnackbar,
  enqueueSnackbar,
  enqueueTranactionError,
  enqueueTranactionsError,
  enqueueTransactionSent,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  usePriorityFees,
} from '@banx/utils'

export const useLoansTransactions = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { isLedger } = useIsLedger()

  const priorityFees = usePriorityFees()

  const { update: updateLoansOptimistic } = useLoansOptimistic()
  const { clear: clearSelection } = useSelectedLoans()

  const repayLoan = async (loan: Loan) => {
    const loadingSnackbarId = uniqueId()

    const txnParam = { loans: [loan], priorityFees }

    await new TxnExecutor(makeRepayLoansAction, {
      wallet: createWalletInstance(wallet),
      connection,
    })
      .addTransactionParam(txnParam)
      .on('sentSome', (results) => {
        results.forEach(({ signature }) => enqueueTransactionSent(signature))
        enqueueWaitingConfirmation(loadingSnackbarId)
      })
      .on('confirmedAll', (results) => {
        const { confirmed, failed } = results

        destroySnackbar(loadingSnackbarId)

        if (failed.length) {
          return enqueueTranactionError()
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
          transactionName: 'Repay',
        })
      })
      .execute()
  }

  const repayPartialLoan = async (loan: Loan, fractionToRepay: number) => {
    const loadingSnackbarId = uniqueId()

    const txnParam = { loan, fractionToRepay, priorityFees }

    await new TxnExecutor(makeRepayPartialLoanAction, {
      wallet: createWalletInstance(wallet),
      connection,
    })
      .addTransactionParam(txnParam)
      .on('sentSome', (results) => {
        results.forEach(({ signature }) => enqueueTransactionSent(signature))
        enqueueWaitingConfirmation(loadingSnackbarId)
      })
      .on('confirmedAll', (results) => {
        const { confirmed, failed } = results

        destroySnackbar(loadingSnackbarId)

        if (failed.length) {
          return enqueueTranactionError()
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
          }
        })
      })
      .on('error', (error) => {
        destroySnackbar(loadingSnackbarId)
        defaultTxnErrorHandler(error, {
          additionalData: txnParam,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'RepayPartial',
        })
      })
      .execute()
  }

  const { selection } = useSelectedLoans()

  const repayBulkLoan = async () => {
    const loadingSnackbarId = uniqueId()

    const selectedLoans = selection.map((loan) => loan.loan)
    const loansChunks = chunkRepayIxnsParams(selectedLoans)

    const txnParams = loansChunks.map((chunk) => ({ loans: chunk, priorityFees: priorityFees }))

    await new TxnExecutor(
      makeRepayLoansAction,
      { wallet: createWalletInstance(wallet), connection },
      { signAllChunkSize: isLedger ? 1 : 40 },
    )
      .addTransactionParams(txnParams)
      .on('sentAll', () => {
        enqueueTransactionsSent()
        enqueueWaitingConfirmation(loadingSnackbarId)
      })
      .on('confirmedAll', (results) => {
        const { confirmed, failed } = results
        const failedTransactionsCount = failed.length

        destroySnackbar(loadingSnackbarId)

        if (failedTransactionsCount) {
          return enqueueTranactionsError(failedTransactionsCount)
        }

        if (confirmed.length) {
          enqueueSnackbar({ message: 'Loans successfully repaid', type: 'success' })

          confirmed.forEach(({ result }) => {
            if (result && wallet.publicKey) {
              updateLoansOptimistic(result, wallet.publicKey.toBase58())
            }
          })
          clearSelection()
        }
      })
      .on('error', (error) => {
        destroySnackbar(loadingSnackbarId)
        defaultTxnErrorHandler(error, {
          additionalData: loansChunks,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'RepayBulk',
        })
      })
      .execute()
  }

  interface LoanWithFractionToRepay {
    loan: Loan
    fractionToRepay: number
  }

  const repayUnpaidLoansInterest = async (loans: LoanWithFractionToRepay[]) => {
    const loadingSnackbarId = uniqueId()

    const txnParams = loans.map((loan) => ({ ...loan, priorityFees }))

    await new TxnExecutor(
      makeRepayPartialLoanAction,
      { wallet: createWalletInstance(wallet), connection },
      { signAllChunkSize: isLedger ? 5 : 40 },
    )
      .addTransactionParams(txnParams)
      .on('sentAll', () => {
        enqueueTransactionsSent()
        enqueueWaitingConfirmation(loadingSnackbarId)
      })
      .on('confirmedAll', (results) => {
        const { confirmed, failed } = results
        const failedTransactionsCount = failed.length

        destroySnackbar(loadingSnackbarId)

        if (failedTransactionsCount) {
          return enqueueTranactionsError(failedTransactionsCount)
        }

        if (confirmed.length) {
          enqueueSnackbar({ message: 'Loans interest successfully paid', type: 'success' })

          confirmed.forEach(({ result }) => {
            if (result && wallet.publicKey) {
              updateLoansOptimistic([result], wallet.publicKey.toBase58())
            }
          })
          clearSelection()
        }
      })
      .on('error', (error) => {
        destroySnackbar(loadingSnackbarId)
        defaultTxnErrorHandler(error, {
          additionalData: loans,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'RepayUnpaidLoansInterest',
        })
      })
      .execute()
  }

  return {
    repayLoan,
    repayBulkLoan,
    repayPartialLoan,
    repayUnpaidLoansInterest,
  }
}

const chunkRepayIxnsParams = (borrowIxnParams: Loan[]) => {
  const ixnsByBorrowType = groupBy(borrowIxnParams, (loan) => getLoanBorrowType(loan))
  return Object.entries(ixnsByBorrowType)
    .map(([type, ixns]) => chunk(ixns, REPAY_NFT_PER_TXN[type as BorrowType]))
    .flat()
}
