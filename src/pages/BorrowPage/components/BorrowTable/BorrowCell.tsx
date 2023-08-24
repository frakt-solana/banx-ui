import React, { FC } from 'react'

import { Button } from '@banx/components/Buttons'

export const BorrowCell: FC<{ onBorrow: () => void; disabled?: boolean }> = ({
  onBorrow,
  disabled = false,
}) => {
  const onClickHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    onBorrow()
    event.stopPropagation()
  }

  return (
    <Button size="small" disabled={disabled} onClick={onClickHandler}>
      Borrow
    </Button>
  )
}
