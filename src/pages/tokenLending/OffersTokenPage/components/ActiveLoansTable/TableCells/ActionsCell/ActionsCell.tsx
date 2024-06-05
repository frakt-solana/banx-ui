import { FC } from 'react'

import { Button } from '@banx/components/Buttons'

import { core } from '@banx/api/tokens'
import { isTokenLoanLiquidated, isTokenLoanTerminating } from '@banx/utils'

import styles from './ActionsCell.module.less'

interface ActionsCellProps {
  loan: core.TokenLoan
  isCardView?: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ loan, isCardView = false }) => {
  const isLoanTerminating = isTokenLoanTerminating(loan)
  const isLoanLiquidated = isTokenLoanLiquidated(loan)

  const canClaim = isLoanLiquidated && isLoanTerminating

  const buttonSize = isCardView ? 'default' : 'small'

  return (
    <div className={styles.actionsButtons}>
      {canClaim && (
        <Button className={styles.actionButton} size={buttonSize}>
          Claim
        </Button>
      )}

      {!canClaim && (
        <Button
          className={styles.actionButton}
          onClick={(event) => {
            event.stopPropagation()
          }}
          disabled={isLoanTerminating}
          variant="secondary"
          size={buttonSize}
        >
          Manage
        </Button>
      )}
    </div>
  )
}
