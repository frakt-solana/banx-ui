import React, { FC } from 'react'

import { Button } from '@banx/components/Buttons'
import { HorizontalCell, createPercentValueJSX } from '@banx/components/TableComponents'

import { core } from '@banx/api/nft'
import { BONDS, SECONDS_IN_DAY } from '@banx/constants'
import { HealthColorIncreasing, getColorByPercent, isFreezeLoan } from '@banx/utils'

import { useRequestLoansTransactions } from '../hooks'

import styles from '../RequestLoansTable.module.less'

export const LTVCell: FC<{ loan: core.Loan }> = ({ loan }) => {
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

export const APRCell: FC<{ loan: core.Loan }> = ({ loan }) => {
  const aprPercent = (loan.bondTradeTransaction.amountOfBonds + BONDS.PROTOCOL_REPAY_FEE) / 100

  return <HorizontalCell value={createPercentValueJSX(aprPercent)} isHighlighted />
}

export const FreezeCell: FC<{ loan: core.Loan }> = ({ loan }) => {
  const terminationFreezeInDays = loan.bondTradeTransaction.terminationFreeze / SECONDS_IN_DAY
  const freezeValue = isFreezeLoan(loan) ? `${terminationFreezeInDays} days` : '--'

  return <HorizontalCell value={freezeValue} />
}

interface ActionsCellProps {
  loan: core.Loan
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
