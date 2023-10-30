import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { chunk, groupBy } from 'lodash'

import { Loan } from '@banx/api/core'
import { useSelectedLoans } from '@banx/pages/LoansPage/loansState'
import { useIsLedger, useLoansOptimistic } from '@banx/store'
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
  const { isLedger } = useIsLedger()

  const { update: updateLoansOptimistic } = useLoansOptimistic()
  const { clearSelection } = useSelectedLoans()

  const repayLoan = async (loan: Loan) => {
    await new TxnExecutor(makeRepayLoansAction, { wallet, connection })
      .addTxnParam([loan])
      .on('pfSuccessAll', (results) => {
        const { txnHash, result } = results[0]
        if (result && wallet.publicKey) {
          enqueueSnackbar({
            message: 'Repaid successfully',
            type: 'success',
            solanaExplorerPath: `tx/${txnHash}`,
          })
          updateLoansOptimistic(result, wallet.publicKey.toBase58())
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
    const txnParam = { loan, fractionToRepay }

    await new TxnExecutor(makeRepayPartialLoanAction, { wallet, connection })
      .addTxnParam(txnParam)
      .on('pfSuccessAll', (results) => {
        const { txnHash, result } = results[0]
        if (result && wallet.publicKey) {
          enqueueSnackbar({
            message: 'Repaid successfully',
            type: 'success',
            solanaExplorerPath: `tx/${txnHash}`,
          })
          updateLoansOptimistic([result], wallet.publicKey.toBase58())
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

  const { selection: selectedLoans } = useSelectedLoans()

  const repayBulkLoan = async () => {
    const loansChunks = chunkRepayIxnsParams(selectedLoans)

    await new TxnExecutor(
      makeRepayLoansAction,
      { wallet, connection },
      { signAllChunks: isLedger ? 1 : 40, rejectQueueOnFirstPfError: false },
    )
      .addTxnParams(loansChunks)
      .on('pfSuccessEach', (results) => {
        results.forEach(({ txnHash, result }) => {
          if (result && wallet.publicKey) {
            enqueueSnackbar({
              message: 'Repaid successfully',
              type: 'success',
              solanaExplorerPath: `tx/${txnHash}`,
            })
            updateLoansOptimistic(result, wallet.publicKey.toBase58())
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
