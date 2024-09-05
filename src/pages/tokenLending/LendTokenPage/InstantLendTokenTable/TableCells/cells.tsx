import { FC } from 'react'

import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

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
  getTokenDecimals,
} from '@banx/utils'

import { calculateLendToBorrowValue } from '../helpers'

import styles from '../InstantLendTokenTable.module.less'

interface DebtCellProps {
  loan: core.TokenLoan
  tokenType: LendingTokenType
}

export const DebtCell: FC<DebtCellProps> = ({ loan, tokenType }) => {
  const marketTokenDecimals = getTokenDecimals(tokenType) //? 1e9, 1e6
  const lentValue = calculateLendToBorrowValue(loan)

  const tooltopContent = (
    <div className={styles.tooltipContainer}>
      {createTooltipContent('Price', loan.collateralPrice / marketTokenDecimals, true)}
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
      value={createPercentValueJSX(loan.bondTradeTransaction.amountOfBonds / 100)}
      isHighlighted
    />
  )
}
