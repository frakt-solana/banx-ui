import { FC } from 'react'

import {
  HorizontalCell,
  createPercentValueJSX,
  createSolValueJSX,
} from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import {
  HealthColorIncreasing,
  calcWeeklyFeeWithRepayFee,
  calculateLoanRepayValue,
  formatDecimal,
  getColorByPercent,
} from '@banx/utils'

import { calcAccruedInterest } from '../helpers'

import styles from '../LoansActiveTable.module.less'

interface TooltipRowProps {
  label: string
  value: number
}
const TooltipRow: FC<TooltipRowProps> = ({ label, value }) => (
  <div className={styles.tooltipRow}>
    <span className={styles.tooltipRowLabel}>{label}</span>
    <span className={styles.tooltipRowValue}>
      {createSolValueJSX(value, 1e9, '0◎', formatDecimal)}
    </span>
  </div>
)

interface CellProps {
  loan: Loan
}

export const DebtCell: FC<CellProps> = ({ loan }) => {
  const { totalRepaidAmount = 0, fraktBond } = loan

  const debtValue = calculateLoanRepayValue(loan)
  const borrowedValue = fraktBond.borrowedAmount

  const totalAccruedInterest = calcAccruedInterest(loan)
  const upfrontFee = borrowedValue / 100

  const weeklyFee = calcWeeklyFeeWithRepayFee(loan)

  const formattedDebtValue = createSolValueJSX(debtValue, 1e9, '0◎', formatDecimal)

  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <TooltipRow label="Principal" value={borrowedValue} />
      <TooltipRow label="Repaid" value={totalRepaidAmount} />
      <TooltipRow label="Accrued interest" value={totalAccruedInterest + upfrontFee} />
      <TooltipRow label="Upfront fee" value={upfrontFee} />
      <TooltipRow label="Est. weekly interest" value={weeklyFee} />
    </div>
  )

  return <HorizontalCell tooltipContent={tooltipContent} value={formattedDebtValue} />
}

export const LTVCell: FC<CellProps> = ({ loan }) => {
  const debtValue = calculateLoanRepayValue(loan)
  const collectionFloor = loan.nft.collectionFloor

  const ltvPercent = (debtValue / collectionFloor) * 100
  const formattedLtvValue = createPercentValueJSX(ltvPercent)

  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <TooltipRow label="Floor" value={collectionFloor} />
      <TooltipRow label="Debt" value={debtValue} />
    </div>
  )

  return (
    <HorizontalCell
      value={formattedLtvValue}
      tooltipContent={tooltipContent}
      textColor={getColorByPercent(ltvPercent, HealthColorIncreasing)}
    />
  )
}

export const APRCell: FC<CellProps> = ({ loan }) => {
  const apr = (loan.bondTradeTransaction.amountOfBonds + BONDS.PROTOCOL_REPAY_FEE) / 100

  return <HorizontalCell value={createPercentValueJSX(apr)} isHighlighted />
}
