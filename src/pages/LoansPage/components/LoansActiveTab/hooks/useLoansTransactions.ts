import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { chunk } from 'lodash'

import { Loan } from '@banx/api/core'
import { useWalletLoans } from '@banx/pages/LoansPage/hooks'
import { useSelectedLoans } from '@banx/pages/LoansPage/loansState'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import { LOANS_PER_TXN, makeRepayLoansAction } from '@banx/transactions/loans'
import { enqueueSnackbar } from '@banx/utils'

export const useLoansTransactions = () => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const { hideLoans } = useWalletLoans()

  const repayLoan = async (loan: Loan) => {
    await new TxnExecutor(makeRepayLoansAction, { wallet, connection })
      .addTxnParam([loan])
      .on('pfSuccessAll', (results) => {
        const { txnHash } = results[0]
        hideLoans([loan.publicKey])
        enqueueSnackbar({
          message: 'Transaction Executed',
          solanaExplorerPath: `tx/${txnHash}`,
        })
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error)
      })
      .execute()
  }

  const { selection: selectedLoans } = useSelectedLoans()

  const repayBulkLoan = async () => {
    const loansChunks = chunk(selectedLoans, LOANS_PER_TXN)

    await new TxnExecutor(makeRepayLoansAction, { wallet, connection })
      .addTxnParams(loansChunks)
      .on('pfSuccessEach', (results) => {
        const { txnHash } = results[0]
        enqueueSnackbar({
          message: 'Transaction Executed',
          solanaExplorerPath: `tx/${txnHash}`,
        })
      })
      .on('pfSuccessSome', () => {
        hideLoans(selectedLoans.map((loan) => loan.publicKey))
      })
      .on('pfError', (error) => {
        defaultTxnErrorHandler(error)
      })
      .execute()
  }

  return {
    repayLoan,
    repayBulkLoan,
  }
}
