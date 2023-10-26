import React, { FC, useState } from 'react'

import { Button } from '@banx/components/Buttons'

import { trackPageEvent } from '@banx/utils'

import styles from './BorrowTable.module.less'

interface BorrowCellProps {
  onBorrow: () => Promise<void>
  disabled?: boolean
  isCardView?: boolean
}

export const BorrowCell: FC<BorrowCellProps> = ({
  onBorrow,
  disabled = false,
  isCardView = false,
}) => {
  const [isBorrowing, setIsBorrowing] = useState(false)
  const onClickHandler = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation()
    setIsBorrowing(true)
    trackPageEvent('borrow', `borrow-lateral`)
    await onBorrow()
    setIsBorrowing(false)
  }

  return (
    <Button
      className={styles.borrowButton}
      size={isCardView ? 'medium' : 'small'}
      disabled={disabled}
      loading={isBorrowing}
      onClick={onClickHandler}
    >
      Borrow
    </Button>
  )
}
