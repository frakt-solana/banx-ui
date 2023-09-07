import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { chunk, groupBy } from 'lodash'

import { Loan } from '@banx/api/core'
import { useSelectedLoans } from '@banx/pages/LoansPage/loansState'
import { useLoansOptimistic } from '@banx/store'
import { BorrowType, defaultTxnErrorHandler } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import {
  MakeRepayLoansActionParams,
  REPAY_NFT_PER_TXN,
  getLoanBorrowType,
  makeRepayLoansAction,
  makeRepayPartialLoanAction,
} from '@banx/transactions/loans'
import { enqueueSnackbar } from '@banx/utils'

export const useLoansTransactions = () => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const { update: updateLoansOptimistic } = useLoansOptimistic()

  const repayLoan = async (loan: Loan) => {
    await new TxnExecutor(makeRepayLoansAction, { wallet, connection })
      .addTxnParam([loan])
      .on('pfSuccessAll', (results) => {
        const { txnHash, result } = results[0]
        if (result && wallet.publicKey) {
          enqueueSnackbar({
            message: 'Transaction Executed',
            solanaExplorerPath: `tx/${txnHash}`,
          })
          updateLoansOptimistic(result, wallet.publicKey.toBase58())
        }
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error)
      })
      .execute()
  }

  const repayPartialLoan = async (loan: Loan, fractionToRepay: number) => {
    await new TxnExecutor(makeRepayPartialLoanAction, { wallet, connection })
      .addTxnParam({ loan, fractionToRepay })
      .on('pfSuccessAll', (results) => {
        const { txnHash, result } = results[0]
        if (result && wallet.publicKey) {
          enqueueSnackbar({
            message: 'Transaction Executed',
            solanaExplorerPath: `tx/${txnHash}`,
          })
          updateLoansOptimistic([result], wallet.publicKey.toBase58())
        }
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error)
      })
      .execute()
  }

  const { selection: selectedLoans } = useSelectedLoans()

  const repayBulkLoan = async () => {
    const loansChunks = chunkRepayIxnsParams(selectedLoans)

    await new TxnExecutor(makeRepayLoansAction, { wallet, connection })
      .addTxnParams(loansChunks)
      .on('pfSuccessEach', (results) => {
        results.forEach(({ txnHash, result }) => {
          if (result && wallet.publicKey) {
            enqueueSnackbar({
              message: 'Transaction Executed',
              solanaExplorerPath: `tx/${txnHash}`,
            })
            updateLoansOptimistic(result, wallet.publicKey.toBase58())
          }
        })
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error)
      })
      .execute()
  }

  return {
    repayLoan,
    repayBulkLoan,
    repayPartialLoan,
  }
}

const chunkRepayIxnsParams = (borrowIxnParams: MakeRepayLoansActionParams) => {
  const ixnsByBorrowType = groupBy(borrowIxnParams, (loan) => getLoanBorrowType(loan))
  return Object.entries(ixnsByBorrowType)
    .map(([type, ixns]) => chunk(ixns, REPAY_NFT_PER_TXN[type as BorrowType]))
    .flat()
}
