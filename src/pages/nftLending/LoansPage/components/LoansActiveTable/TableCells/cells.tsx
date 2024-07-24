import { FC } from 'react'

import {
  DisplayValue,
  HorizontalCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'

import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import {
  HealthColorIncreasing,
  calcWeeklyFeeWithRepayFee,
  calculateLoanRepayValue,
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
      <DisplayValue value={value} />
    </span>
  </div>
)

interface CellProps {
  loan: core.Loan
}

export const DebtCell: FC<CellProps> = ({ loan }) => {
  const { fraktBond, bondTradeTransaction } = loan

  const debtValue = calculateLoanRepayValue(loan)
  const borrowedValue = fraktBond.borrowedAmount

  const totalAccruedInterest = calcAccruedInterest(loan)

  const upfrontFee = bondTradeTransaction.borrowerOriginalLent / 100

  const weeklyFee = calcWeeklyFeeWithRepayFee(loan)

  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <TooltipRow label="Principal" value={borrowedValue} />
      <TooltipRow label="Repaid" value={bondTradeTransaction.borrowerFullRepaidAmount} />
      <TooltipRow label="Accrued interest" value={totalAccruedInterest} />
      <TooltipRow label="Upfront fee" value={upfrontFee} />
      <TooltipRow label="Est. weekly interest" value={weeklyFee} />
    </div>
  )

  return (
    <HorizontalCell tooltipContent={tooltipContent} value={<DisplayValue value={debtValue} />} />
  )
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
