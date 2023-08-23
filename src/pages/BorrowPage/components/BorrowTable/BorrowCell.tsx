import React, { FC } from 'react'

import { Button } from '@banx/components/Buttons'

import { useBorrowTable } from './hooks'
import { TableNftData } from './types'

export const BorrowCell: FC<{ nft: TableNftData; disabled?: boolean }> = ({
  nft,
  disabled = false,
}) => {
  const { borrow } = useBorrowTable()

  const onClickHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    borrow(nft)
    event.stopPropagation()
  }

  return (
    <Button size="small" disabled={disabled} onClick={onClickHandler}>
      Borrow
    </Button>
  )
}
