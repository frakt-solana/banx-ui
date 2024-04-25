import { FC } from 'react'

import {
  DisplayValue,
  HorizontalCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { HealthColorIncreasing, calculateLoanRepayValue, getColorByPercent } from '@banx/utils'

import styles from '../InstantLendTable.module.less'

export const DebtCell: FC<{ loan: Loan }> = ({ loan }) => {
  const repayValue = calculateLoanRepayValue(loan)
  const collectionFloor = loan.nft.collectionFloor

  const tooltopContent = (
    <div className={styles.tooltipContainer}>
      {createTooltipContent('Floor', collectionFloor)}
      {createTooltipContent('Debt', repayValue)}
    </div>
  )

  return (
    <HorizontalCell tooltipContent={tooltopContent} value={<DisplayValue value={repayValue} />} />
  )
}

const createTooltipContent = (label: string, value: number) => (
  <div className={styles.tooltipContent}>
    <span>{label}</span>
    <DisplayValue value={value} />
  </div>
)

export const LTVCell: FC<{ loan: Loan }> = ({ loan }) => {
  const repayValue = calculateLoanRepayValue(loan)

  const collectionFloor = loan.nft.collectionFloor
  const ltv = (repayValue / collectionFloor) * 100

  return (
    <HorizontalCell
      value={createPercentValueJSX(ltv)}
      textColor={getColorByPercent(ltv, HealthColorIncreasing)}
    />
  )
}
