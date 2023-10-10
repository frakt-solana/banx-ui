import React, { FC } from 'react'

import { Button } from '@banx/components/Buttons'

import { trackPageEvent } from '@banx/utils'

import styles from './BorrowTable.module.less'

interface BorrowCellProps {
  onBorrow: () => void
  disabled?: boolean
  isCardView?: boolean
}

export const BorrowCell: FC<BorrowCellProps> = ({
  onBorrow,
  disabled = false,
  isCardView = false,
}) => {
  const onClickHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    onBorrow()
    trackPageEvent('borrow', `borrow-lateral`)
    event.stopPropagation()
  }

  return (
    <Button
      className={styles.borrowButton}
      size={isCardView ? 'large' : 'small'}
      disabled={disabled}
      onClick={onClickHandler}
    >
      Borrow
    </Button>
  )
}
