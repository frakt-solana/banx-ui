import { FC } from 'react'

import {
  DisplayValue,
  HorizontalCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { HealthColorIncreasing, getColorByPercent } from '@banx/utils'

import { calculateLendValue } from '../helpers'

import styles from '../InstantLendTable.module.less'

export const DebtCell: FC<{ loan: Loan }> = ({ loan }) => {
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
    <span>{label}</span>
    <DisplayValue value={value} />
  </div>
)

export const LTVCell: FC<{ loan: Loan }> = ({ loan }) => {
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
