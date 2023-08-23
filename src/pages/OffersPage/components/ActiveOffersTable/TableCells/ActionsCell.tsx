import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'

import { Button } from '@banx/components/Buttons'

import { Loan } from '@banx/api/core'
import { buildAndExecuteTransaction } from '@banx/transactions'
import { makeClaimLoanTransaction, makeTerminateLoanTransaction } from '@banx/transactions/loans'

import styles from '../ActiveOffersTable.module.less'

interface ActionsCellProps {
  loan: Loan
  isCardView: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ loan, isCardView }) => {
  const { terminateLoan, claimLoan } = useLendLoansTransactions()
  const buttonSize = isCardView ? 'large' : 'small'

  const isActiveLoan =
    loan.bondTradeTransaction.bondTradeTransactionState ===
    BondTradeTransactionV2State.PerpetualActive

  return (
    <div className={styles.actionsButtons}>
      {isActiveLoan && (
        <>
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
        </>
      )}
      {!isActiveLoan && (
        <Button onClick={() => claimLoan(loan)} size={buttonSize} className={styles.instantButton}>
          Claim NFT
        </Button>
      )}
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

  const claimLoan = async (loan: Loan) => {
    await buildAndExecuteTransaction({
      wallet,
      connection,
      makeTransactionFn: makeClaimLoanTransaction,
      transactionParams: { loan },
    })
  }

  return { terminateLoan, claimLoan }
}
