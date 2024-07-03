import { FC } from 'react'

import {
  DisplayValue,
  HorizontalCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'

import { core } from '@banx/api/tokens'
import {
  HealthColorIncreasing,
  calculateTokenLoanLtvByLoanValue,
  getColorByPercent,
} from '@banx/utils'

import { calculateLendToBorrowApr, calculateLendToBorrowValue } from '../helpers'

import styles from '../InstantLendTokenTable.module.less'

export const DebtCell: FC<{ loan: core.TokenLoan }> = ({ loan }) => {
  const lentValue = calculateLendToBorrowValue(loan)

  const tooltopContent = (
    <div className={styles.tooltipContainer}>
      {createTooltipContent('Price', loan.collateralPrice, true)}
      {createTooltipContent('Debt', lentValue)}
    </div>
  )

  return (
    <HorizontalCell tooltipContent={tooltopContent} value={<DisplayValue value={lentValue} />} />
  )
}

const createTooltipContent = (label: string, value: number, isSubscriptFormat = false) => (
  <div className={styles.tooltipContent}>
    <span className={styles.tooltipLabel}>{label}</span>
    <span className={styles.tooltipValue}>
      <DisplayValue value={value} isSubscriptFormat={isSubscriptFormat} />
    </span>
  </div>
)

export const LTVCell: FC<{ loan: core.TokenLoan }> = ({ loan }) => {
  const lentValue = calculateLendToBorrowValue(loan)
  const ltv = calculateTokenLoanLtvByLoanValue(loan, lentValue)

  return (
    <HorizontalCell
      value={createPercentValueJSX(ltv)}
      textColor={getColorByPercent(ltv, HealthColorIncreasing)}
    />
  )
}

export const APRCell: FC<{ loan: core.TokenLoan }> = ({ loan }) => {
  return (
    <HorizontalCell
      value={createPercentValueJSX(calculateLendToBorrowApr(loan) / 100)}
      isHighlighted
    />
  )
}
