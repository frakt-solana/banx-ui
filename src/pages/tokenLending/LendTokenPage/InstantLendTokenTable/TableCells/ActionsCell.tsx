import React, { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'

import { core } from '@banx/api/tokens'

import styles from '../InstantLendTokenTable.module.less'

interface RefinanceCellProps {
  loan: core.TokenLoan
  isCardView: boolean
  disabledAction: boolean
}

export const ActionsCell: FC<RefinanceCellProps> = ({ isCardView, disabledAction }) => {
  const onClickHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation()
  }

  return (
    <div className={classNames(styles.actionsCell, { [styles.cardView]: isCardView })}>
      <Button
        className={styles.actionButton}
        onClick={onClickHandler}
        size={isCardView ? 'default' : 'small'}
        disabled={disabledAction}
      >
        Lend
      </Button>
    </div>
  )
}
