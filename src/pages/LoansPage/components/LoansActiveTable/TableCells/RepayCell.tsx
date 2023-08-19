import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'

import { Loan } from '@banx/api/core'
import { useWalletLoans } from '@banx/pages/LoansPage/hooks'
import {
  MakeTransactionFn,
  TransactionParams,
  buildAndExecuteTransaction,
} from '@banx/transactions'
import { MakeRepayLoanTransaction, makeRepayLoanTransaction } from '@banx/transactions/loans'

interface RepayCellProps {
  loan: Loan
  isCardView: boolean
}

export const RepayCell: FC<RepayCellProps> = ({ loan, isCardView }) => {
  const onRepayLoan = useRepayLoan(loan)

  return (
    <Button
      size={isCardView ? 'large' : 'small'}
      onClick={(event) => {
        onRepayLoan()
        event.stopPropagation()
      }}
    >
      Repay
    </Button>
  )
}

const useRepayLoan = (loan: Loan) => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const { hideLoan } = useWalletLoans()

  const executeLoanTransaction = async <T extends object>(props: {
    makeTransactionFn: MakeTransactionFn<TransactionParams<T>>
    transactionParams: TransactionParams<T>
    onSuccess: () => void
  }) => {
    await buildAndExecuteTransaction({
      wallet,
      connection,
      ...props,
    })
  }

  const repayLoan = async () => {
    await executeLoanTransaction<MakeRepayLoanTransaction>({
      makeTransactionFn: makeRepayLoanTransaction,
      transactionParams: { loan },
      onSuccess: () => hideLoan(loan.publicKey),
    })
  }

  return repayLoan
}
