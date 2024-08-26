import { FC } from 'react'

import { Button } from '@banx/components/Buttons'

import { core } from '@banx/api/tokens'
import { useModal } from '@banx/store/common'
import { isTokenLoanTerminating } from '@banx/utils'

import { RefinanceTokenModal } from './RefinanceTokenModal'
import { RepayTokenModal } from './RepayTokenModal'

import styles from './ActionsCell.module.less'

interface ActionsCellProps {
  loan: core.TokenLoan
  isCardView: boolean
  disableActions: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ loan, isCardView, disableActions }) => {
  const { open } = useModal()

  const isLoanTerminating = isTokenLoanTerminating(loan)
  const buttonSize = isCardView ? 'default' : 'small'

  return (
    <div className={styles.actionsButtons}>
      <Button
        className={styles.refinanceButton}
        size={buttonSize}
        variant="secondary"
        onClick={(event) => {
          open(RefinanceTokenModal, { loan })
          event.stopPropagation()
        }}
      >
        {isLoanTerminating ? 'Extend' : 'Reborrow'}
      </Button>
      <Button
        className={styles.repayButton}
        size={buttonSize}
        disabled={disableActions}
        onClick={(event) => {
          open(RepayTokenModal, { loan })
          event.stopPropagation()
        }}
      >
        Repay
      </Button>
    </div>
  )
}
