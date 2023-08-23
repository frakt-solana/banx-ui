import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'

import { Button } from '@banx/components/Buttons'

import { Loan } from '@banx/api/core'
import { TxnExecutor } from '@banx/transactions/TxnExecutor'
import {
  makeClaimAction,
  makeInstantRefinanceAction,
  makeTerminateAction,
} from '@banx/transactions/loans'

import styles from '../ActiveOffersTable.module.less'

interface ActionsCellProps {
  loan: Loan
  isCardView: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ loan, isCardView }) => {
  const { bondTradeTransactionState } = loan.bondTradeTransaction

  const { terminateLoan, claimLoan, instantLoan } = useLendLoansTransactions()
  const buttonSize = isCardView ? 'large' : 'small'

  const isActiveLoan = bondTradeTransactionState === BondTradeTransactionV2State.PerpetualActive
  const isTerminatingLoan =
    bondTradeTransactionState === BondTradeTransactionV2State.PerpetualManualTerminating

  return (
    <div className={styles.actionsButtons}>
      {isActiveLoan || isTerminatingLoan ? (
        <>
          <Button
            onClick={() => terminateLoan(loan)}
            className={styles.terminateButton}
            disabled={isTerminatingLoan}
            variant="secondary"
            size={buttonSize}
          >
            Terminate
          </Button>
          <Button
            onClick={() => instantLoan(loan)}
            className={styles.instantButton}
            disabled={isTerminatingLoan}
            variant="secondary"
            size={buttonSize}
          >
            Instant
          </Button>
        </>
      ) : (
        <Button onClick={() => claimLoan(loan)} className={styles.instantButton} size={buttonSize}>
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

  const terminateLoan = (loan: Loan) => {
    new TxnExecutor(makeTerminateAction, { wallet, connection }).addTxnParams({ loan }).execute()
  }

  const claimLoan = (loan: Loan) => {
    new TxnExecutor(makeClaimAction, { wallet, connection }).addTxnParams({ loan }).execute()
  }

  const instantLoan = (loan: Loan) => {
    new TxnExecutor(makeInstantRefinanceAction, { wallet, connection })
      .addTxnParams({ loan })
      .execute()
  }

  return { terminateLoan, claimLoan, instantLoan }
}
