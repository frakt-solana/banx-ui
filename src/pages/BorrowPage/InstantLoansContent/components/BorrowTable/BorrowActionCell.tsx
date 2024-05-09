import React, { FC, useState } from 'react'

import { Button } from '@banx/components/Buttons'

import styles from './BorrowTable.module.less'

interface BorrowActionCellProps {
  onBorrow: () => Promise<void>
  disabled?: boolean
  isCardView?: boolean
  goToRequestLoanTab: () => void
}

export const BorrowActionCell: FC<BorrowActionCellProps> = ({
  onBorrow,
  disabled = false,
  isCardView = false,
  goToRequestLoanTab,
}) => {
  const [isBorrowing, setIsBorrowing] = useState(false)

  const onClickHandler = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation()

    if (disabled) {
      return goToRequestLoanTab()
    }

    setIsBorrowing(true)
    await onBorrow()
    setIsBorrowing(false)
  }

  return (
    <Button
      className={styles.borrowButton}
      size={isCardView ? 'default' : 'small'}
      loading={isBorrowing}
      onClick={onClickHandler}
    >
      {disabled ? 'Request' : 'Borrow'}
    </Button>
  )
}
