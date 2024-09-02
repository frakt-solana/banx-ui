import React, { FC, useState } from 'react'

import { Button } from '@banx/components/Buttons'

import styles from './BorrowTable.module.less'

interface BorrowActionCellProps {
  onBorrow: () => Promise<void>
  loanValue: number
  disabled: boolean
  isCardView?: boolean
  goToRequestLoanTab: () => void
}

export const BorrowActionCell: FC<BorrowActionCellProps> = ({
  onBorrow,
  loanValue,
  disabled,
  isCardView = false,
  goToRequestLoanTab,
}) => {
  const [isBorrowing, setIsBorrowing] = useState(false)

  const onClickHandler = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation()

    if (!loanValue) {
      return goToRequestLoanTab()
    }

    setIsBorrowing(true)
    await onBorrow()
    setIsBorrowing(false)
  }

  return (
    <Button
      className={styles.borrowButton}
      size={isCardView ? 'large' : 'medium'}
      loading={isBorrowing}
      onClick={onClickHandler}
      disabled={disabled}
    >
      {loanValue ? 'Borrow' : 'List'}
    </Button>
  )
}
