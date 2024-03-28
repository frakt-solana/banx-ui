import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { chunk, groupBy } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Loan } from '@banx/api/core'
import { useSelectedLoans } from '@banx/pages/LoansPage/loansState'
import {
  useIsLedger,
  /*useLoansOptimistic*/
} from '@banx/store'
import { BorrowType, defaultTxnErrorHandler } from '@banx/transactions'
import {
  REPAY_NFT_PER_TXN,
  getLoanBorrowType,
  makeRepayLoansAction,
  makeRepayPartialLoanAction,
} from '@banx/transactions/loans'
import { enqueueSnackbar, usePriorityFees } from '@banx/utils'

export const useLoansTransactions = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { isLedger } = useIsLedger()

  const priorityFees = usePriorityFees()

  // const { update: updateLoansOptimistic } = useLoansOptimistic()
  const { clear: clearSelection } = useSelectedLoans()

  const repayLoan = async (loan: Loan) => {
    const txnParam = { loans: [loan], priorityFees }

    await new TxnExecutor(makeRepayLoansAction, { wallet, connection })
      .addTxnParam(txnParam)
      // .on('pfSuccessAll', (results) => {
      //   const { txnHash, result } = results[0]
      //   if (result && wallet.publicKey) {
      //     enqueueSnackbar({
      //       message: 'Repaid successfully',
      //       type: 'success',
      //       solanaExplorerPath: `tx/${txnHash}`,
      //     })
      //     updateLoansOptimistic(result, wallet.publicKey.toBase58())
      //   }
      //   clearSelection()
      // })
      .on('pfSuccessAll', (results) => {
        const { txnHash, result } = results[0]
        if (result && wallet.publicKey) {
          enqueueSnackbar({
            message: 'Transactions sent',
            type: 'info',
            solanaExplorerPath: `tx/${txnHash}`,
          })
        }
        clearSelection()
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error, {
          additionalData: loan,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Repay',
        })
      })
      .execute()
  }

  const repayPartialLoan = async (loan: Loan, fractionToRepay: number) => {
    const txnParam = { loan, fractionToRepay, priorityFees }

    await new TxnExecutor(makeRepayPartialLoanAction, { wallet, connection })
      .addTxnParam(txnParam)
      // .on('pfSuccessAll', (results) => {
      //   const { txnHash, result } = results[0]
      //   if (result && wallet.publicKey) {
      //     enqueueSnackbar({
      //       message: 'Repaid successfully',
      //       type: 'success',
      //       solanaExplorerPath: `tx/${txnHash}`,
      //     })
      //     updateLoansOptimistic([result], wallet.publicKey.toBase58())
      //   }
      //   clearSelection()
      // })
      .on('pfSuccessAll', (results) => {
        const { txnHash, result } = results[0]
        if (result && wallet.publicKey) {
          enqueueSnackbar({
            message: 'Transaction sent',
            type: 'info',
            solanaExplorerPath: `tx/${txnHash}`,
          })
        }
        clearSelection()
      })
      .on('pfError', (error) => {
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
    const selectedLoans = selection.map((loan) => loan.loan)
    const loansChunks = chunkRepayIxnsParams(selectedLoans)

    const txnParams = loansChunks.map((chunk) => ({ loans: chunk, priorityFees: priorityFees }))

    await new TxnExecutor(
      makeRepayLoansAction,
      { wallet, connection },
      { signAllChunks: isLedger ? 1 : 40, rejectQueueOnFirstPfError: false },
    )
      .addTxnParams(txnParams)
      // .on('pfSuccessEach', (results) => {
      //   results.forEach(({ txnHash, result }) => {
      //     if (result && wallet.publicKey) {
      //       enqueueSnackbar({
      //         message: 'Repaid successfully',
      //         type: 'success',
      //         solanaExplorerPath: `tx/${txnHash}`,
      //       })
      //       updateLoansOptimistic(result, wallet.publicKey.toBase58())
      //     }
      //   })
      // })
      .on('pfSuccessEach', (results) => {
        results.forEach(({ txnHash, result }) => {
          if (result && wallet.publicKey) {
            enqueueSnackbar({
              message: 'Transaction sent',
              type: 'info',
              solanaExplorerPath: `tx/${txnHash}`,
            })
          }
        })
      })
      .on('pfSuccessAll', () => {
        clearSelection()
      })
      .on('pfError', (error) => {
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
    const txnParams = loans.map((loan) => ({ ...loan, priorityFees }))

    await new TxnExecutor(
      makeRepayPartialLoanAction,
      { wallet, connection },
      { signAllChunks: isLedger ? 5 : 40 },
    )
      .addTxnParams(txnParams)
      // .on('pfSuccessEach', (results) => {
      //   results.forEach(({ txnHash, result }) => {
      //     if (result && wallet.publicKey) {
      //       enqueueSnackbar({
      //         message: 'Loan interest paid successfully',
      //         type: 'success',
      //         solanaExplorerPath: `tx/${txnHash}`,
      //       })

      //       if (result) {
      //         updateLoansOptimistic([result], wallet.publicKey.toBase58())
      //       }
      //     }
      //   })
      // })
      .on('pfSuccessAll', () => {
        clearSelection()
      })
      .on('pfError', (error) => {
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
