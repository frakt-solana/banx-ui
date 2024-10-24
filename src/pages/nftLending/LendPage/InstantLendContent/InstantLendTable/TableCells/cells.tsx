import { FC } from 'react'

import {
  DisplayValue,
  HorizontalCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'

import { core } from '@banx/api/nft'
import {
  HealthColorIncreasing,
  calculateLendValue,
  calculateLenderApr,
  getColorByPercent,
  isLoanTerminating,
} from '@banx/utils'

import styles from '../InstantLendTable.module.less'

export const DebtCell: FC<{ loan: core.Loan }> = ({ loan }) => {
  const lendValue = calculateLendValue(loan)

  const collectionFloor = loan.nft.collectionFloor

  const tooltopContent = (
    <div className={styles.tooltipContainer}>
      {createTooltipContent('Floor', collectionFloor)}
      {createTooltipContent('Debt', lendValue)}
    </div>
  )

  return (
    <HorizontalCell tooltipContent={tooltopContent} value={<DisplayValue value={lendValue} />} />
  )
}

const createTooltipContent = (label: string, value: number) => (
  <div className={styles.tooltipContent}>
    <span className={styles.tooltipContentLabel}>{label}</span>
    <span className={styles.tooltipContentValue}>
      <DisplayValue value={value} />
    </span>
  </div>
)

export const LTVCell: FC<{ loan: core.Loan }> = ({ loan }) => {
  const lendValue = calculateLendValue(loan)

  const collectionFloor = loan.nft.collectionFloor
  const ltv = (lendValue / collectionFloor) * 100

  return (
    <HorizontalCell
      value={createPercentValueJSX(ltv)}
      textColor={getColorByPercent(ltv, HealthColorIncreasing)}
    />
  )
}

export const APRCell: FC<{ loan: core.Loan }> = ({ loan }) => {
  const isTerminatingStatus = isLoanTerminating(loan)

  const apr = isTerminatingStatus
    ? calculateLenderApr(loan)
    : loan.bondTradeTransaction.amountOfBonds

  return <HorizontalCell value={createPercentValueJSX(apr / 100)} isHighlighted />
}
