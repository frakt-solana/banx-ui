import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { chunk } from 'lodash'

import { Loan } from '@banx/api/core'
import { useWalletLoans } from '@banx/pages/LoansPage/hooks'
import { useSelectedLoans } from '@banx/pages/LoansPage/loansState'
import { buildAndExecuteTransaction, signAndSendAllTransactions } from '@banx/transactions'
import { makeRepayLoanTransaction } from '@banx/transactions/loans'

const LOAN_REPAYMENT_CHUNK_SIZE = 1

export const useLoansTransactions = () => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const { hideLoans } = useWalletLoans()

  const repayLoan = async (loan: Loan) => {
    await buildAndExecuteTransaction({
      wallet,
      connection,
      makeTransactionFn: makeRepayLoanTransaction,
      transactionParams: { loans: [loan] },
      onSuccess: () => hideLoans([loan.publicKey]),
    })
  }

  const { selection: selectedLoans } = useSelectedLoans()

  const repayBulkLoan = async () => {
    const loansChunks = chunk(selectedLoans, LOAN_REPAYMENT_CHUNK_SIZE)

    const transactionsAndSigners = []

    for (const loans of loansChunks) {
      const { transaction, signers } = await makeRepayLoanTransaction({
        loans,
        wallet,
        connection,
      })

      transactionsAndSigners.push({ transaction, signers })
    }

    return await signAndSendAllTransactions({
      transactionsAndSigners,
      connection,
      wallet,
      onSuccess: () => hideLoans(selectedLoans.map((loan) => loan.publicKey)),
    })
  }

  return {
    repayLoan,
    repayBulkLoan,
  }
}
