import React, { FC } from 'react'

import { Button } from '@banx/components/Buttons'

import styles from './BorrowTable.module.less'

export const BorrowCell: FC<{ onBorrow: () => void; disabled?: boolean; isCardView?: boolean }> = ({
  onBorrow,
  disabled = false,
  isCardView = false,
}) => {
  const onClickHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    onBorrow()
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
