import React, { FC } from 'react'

import { Button } from '@banx/components/Buttons'
import { HorizontalCell, createPercentValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { HealthColorIncreasing, getColorByPercent } from '@banx/utils'

import { useRequestLoansTransactions } from '../hooks'

import styles from '../RequestLoansTable.module.less'

export const LTVCell: FC<{ loan: Loan }> = ({ loan }) => {
  const borrowedValue = loan.fraktBond.borrowedAmount
  const collectionFloor = loan.nft.collectionFloor

  const ltvPercent = (borrowedValue / collectionFloor) * 100
  const formattedLtvValue = createPercentValueJSX(ltvPercent)

  return (
    <HorizontalCell
      value={formattedLtvValue}
      textColor={getColorByPercent(ltvPercent, HealthColorIncreasing)}
    />
  )
}

export const APRCell: FC<{ loan: Loan }> = ({ loan }) => {
  const aprInPercent = loan.bondTradeTransaction.amountOfBonds / 100

  return <HorizontalCell value={createPercentValueJSX(aprInPercent)} isHighlighted />
}

export const FreezeCell: FC<{ loan: Loan }> = () => {
  return <HorizontalCell value={`${14} days`} />
}

interface ActionsCellProps {
  loan: Loan
  disabled: boolean
  isCardView: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ loan, disabled, isCardView }) => {
  const { delist } = useRequestLoansTransactions()

  const onButtonClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    delist(loan)
    event.stopPropagation()
  }

  return (
    <Button
      onClick={onButtonClick}
      size={isCardView ? 'default' : 'small'}
      className={styles.delistButton}
      disabled={disabled}
    >
      Delist
    </Button>
  )
}
