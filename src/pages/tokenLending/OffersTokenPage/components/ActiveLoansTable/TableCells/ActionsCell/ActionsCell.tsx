import { FC } from 'react'

import { Button } from '@banx/components/Buttons'

import { core } from '@banx/api/tokens'
import { useModal } from '@banx/store/common'
import { isTokenLoanLiquidated, isTokenLoanTerminating } from '@banx/utils'

import ManageModal from '../../ManageModal'

import styles from './ActionsCell.module.less'

interface ActionsCellProps {
  loan: core.TokenLoan
  isCardView?: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ loan, isCardView = false }) => {
  const { open } = useModal()

  const isLoanTerminating = isTokenLoanTerminating(loan)
  const isLoanLiquidated = isTokenLoanLiquidated(loan)

  const canClaim = isLoanLiquidated && isLoanTerminating

  const showModal = () => {
    open(ManageModal, { loan })
  }

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
            showModal()
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
