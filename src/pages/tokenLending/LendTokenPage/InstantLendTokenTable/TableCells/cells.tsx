import { FC } from 'react'

import {
  DisplayValue,
  HorizontalCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'

import { core } from '@banx/api/tokens'
import { HealthColorIncreasing, getColorByPercent } from '@banx/utils'

import styles from '../InstantLendTokenTable.module.less'

export const DebtCell: FC<{ loan: core.TokenLoan }> = () => {
  const lentValue = 0
  const collectionFloor = 0

  const tooltopContent = (
    <div className={styles.tooltipContainer}>
      {createTooltipContent('Floor', collectionFloor)}
      {createTooltipContent('Debt', lentValue)}
    </div>
  )

  return (
    <HorizontalCell tooltipContent={tooltopContent} value={<DisplayValue value={lentValue} />} />
  )
}

const createTooltipContent = (label: string, value: number) => (
  <div className={styles.tooltipContent}>
    <span>{label}</span>
    <DisplayValue value={value} />
  </div>
)

export const LTVCell: FC<{ loan: core.TokenLoan }> = () => {
  const ltv = 0

  return (
    <HorizontalCell
      value={createPercentValueJSX(ltv)}
      textColor={getColorByPercent(ltv, HealthColorIncreasing)}
    />
  )
}

export const APRCell: FC<{ loan: core.TokenLoan }> = ({ loan }) => {
  const apr = loan.bondTradeTransaction.amountOfBonds

  return <HorizontalCell value={createPercentValueJSX(apr / 100)} isHighlighted />
}
