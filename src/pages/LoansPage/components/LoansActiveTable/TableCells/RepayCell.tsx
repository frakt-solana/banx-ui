import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'

import { Loan } from '@banx/api/loans'
import {
  MakeTransactionFn,
  TransactionParams,
  buildAndExecuteTransaction,
} from '@banx/transactions'
import { MakeRepayLoanTransaction, makeRepayLoanTransaction } from '@banx/transactions/loans'

export const RepayCell: FC<{ loan: Loan }> = ({ loan }) => {
  const { onRepayLoan } = useLoanTransactions(loan)

  return (
    <Button
      size="small"
      onClick={(event) => {
        onRepayLoan()
        event.stopPropagation()
      }}
    >
      Repay
    </Button>
  )
}

const useLoanTransactions = (loan: Loan) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const executeLoanTransaction = async <T extends object>(
    makeTransactionFn: MakeTransactionFn<TransactionParams<T>>,
    transactionParams: TransactionParams<T>,
  ) => {
    const result = await buildAndExecuteTransaction<
      TransactionParams<T>,
      ReturnType<MakeTransactionFn<TransactionParams<T>>>
    >({
      makeTransactionFn,
      transactionParams,
      wallet,
      connection,
    })
    return result
  }

  const onRepayLoan = async () => {
    await executeLoanTransaction<MakeRepayLoanTransaction>(makeRepayLoanTransaction, { loan })
  }

  return { onRepayLoan }
}
