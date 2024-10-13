import React, { FC } from 'react'

import { Button } from '@banx/components/Buttons'
import { HorizontalCell, createPercentValueJSX } from '@banx/components/TableComponents'

import { TokenLoan } from '@banx/api/tokens'
import { BONDS, SECONDS_IN_DAY } from '@banx/constants'
import {
  HealthColorIncreasing,
  calculateTokenLoanLtvByLoanValue,
  getColorByPercent,
  isTokenLoanFrozen,
} from '@banx/utils'

import styles from './TokenLoanListingsTable.module.less'

export const LTVCell: FC<{ loan: TokenLoan }> = ({ loan }) => {
  const borrowedValue = loan.fraktBond.borrowedAmount

  const ltvPercent = calculateTokenLoanLtvByLoanValue(loan, borrowedValue)

  return (
    <HorizontalCell
      value={createPercentValueJSX(ltvPercent)}
      textColor={getColorByPercent(ltvPercent, HealthColorIncreasing)}
    />
  )
}

export const APRCell: FC<{ loan: TokenLoan }> = ({ loan }) => {
  const aprPercent = (loan.bondTradeTransaction.amountOfBonds + BONDS.REPAY_FEE_APR) / 100

  return <HorizontalCell value={createPercentValueJSX(aprPercent)} isHighlighted />
}

export const FreezeCell: FC<{ loan: TokenLoan }> = ({ loan }) => {
  const terminationFreezeInDays = loan.bondTradeTransaction.terminationFreeze / SECONDS_IN_DAY
  const freezeDuration = isTokenLoanFrozen(loan) ? `${terminationFreezeInDays} days` : '--'

  return <HorizontalCell value={freezeDuration} />
}

interface ActionsCellProps {
  loan: TokenLoan
  disabled: boolean
  isCardView: boolean
}

export const ActionsCell: FC<ActionsCellProps> = ({ loan, disabled, isCardView }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  const delist = (loan: TokenLoan) => {}

  const onButtonClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    delist(loan)
    event.stopPropagation()
  }

  return (
    <Button
      onClick={onButtonClick}
      size={isCardView ? 'large' : 'medium'}
      className={styles.delistButton}
      disabled={disabled}
    >
      Delist
    </Button>
  )
}
