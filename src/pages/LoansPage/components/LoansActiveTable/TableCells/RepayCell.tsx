import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'

import { Loan } from '@banx/api/loans'
import { useWalletLoans } from '@banx/pages/LoansPage/hooks'
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

  const publicKeyString = wallet.publicKey?.toBase58() || ''
  const { hideLoan } = useWalletLoans(publicKeyString)

  const executeLoanTransaction = async <T extends object>(props: {
    makeTransactionFn: MakeTransactionFn<TransactionParams<T>>
    transactionParams: TransactionParams<T>
    onAfterSuccess: () => void
  }) => {
    await buildAndExecuteTransaction({
      wallet,
      connection,
      ...props,
    })
  }

  const onRepayLoan = async () => {
    await executeLoanTransaction<MakeRepayLoanTransaction>({
      makeTransactionFn: makeRepayLoanTransaction,
      transactionParams: { loan },
      onAfterSuccess: () => hideLoan(loan.publicKey),
    })
  }

  return { onRepayLoan }
}
