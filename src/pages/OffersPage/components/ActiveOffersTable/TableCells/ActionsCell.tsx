import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'

import { Loan } from '@banx/api/core'
import { buildAndExecuteTransaction } from '@banx/transactions'
import { makeTerminateLoanTransaction } from '@banx/transactions/loans'

import styles from '../ActiveOffersTable.module.less'

interface ActionsCellProps {
  loan: Loan
  isCardView: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ loan, isCardView }) => {
  const { terminateLoan } = useLendLoansTransactions()
  const buttonSize = isCardView ? 'large' : 'small'

  return (
    <div className={styles.actionsButtons}>
      <Button
        onClick={() => terminateLoan(loan)}
        className={styles.terminateButton}
        variant="secondary"
        size={buttonSize}
      >
        Terminate
      </Button>
      <Button size={buttonSize} className={styles.instantButton} variant="secondary">
        Instant
      </Button>
    </div>
  )
}

export default ActionsCell

export const useLendLoansTransactions = () => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const terminateLoan = async (loan: Loan) => {
    await buildAndExecuteTransaction({
      wallet,
      connection,
      makeTransactionFn: makeTerminateLoanTransaction,
      transactionParams: { loan },
    })
  }

  return { terminateLoan }
}
