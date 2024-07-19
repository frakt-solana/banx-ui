import { FC } from 'react'

import {
  DisplayValue,
  HorizontalCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'

import { coreNew } from '@banx/api/nft'
import {
  HealthColorIncreasing,
  calculateLendValue,
  calculateLenderApr,
  getColorByPercent,
  isLoanTerminating,
} from '@banx/utils'

import styles from '../InstantLendTable.module.less'

export const DebtCell: FC<{ loan: coreNew.Loan }> = ({ loan }) => {
  const lendValue = calculateLendValue(loan)

  const collectionFloor = loan.nft.collectionFloor

  const tooltopContent = (
    <div className={styles.tooltipContainer}>
      {createTooltipContent('Floor', collectionFloor.toNumber())}
      {createTooltipContent('Debt', lendValue.toNumber())}
    </div>
  )

  return (
    <HorizontalCell
      tooltipContent={tooltopContent}
      value={<DisplayValue value={lendValue.toNumber()} />}
    />
  )
}

const createTooltipContent = (label: string, value: number) => (
  <div className={styles.tooltipContent}>
    <span>{label}</span>
    <DisplayValue value={value} />
  </div>
)

export const LTVCell: FC<{ loan: coreNew.Loan }> = ({ loan }) => {
  const lendValue = calculateLendValue(loan).toNumber()

  const collectionFloor = loan.nft.collectionFloor.toNumber()
  const ltv = (lendValue / collectionFloor) * 100

  return (
    <HorizontalCell
      value={createPercentValueJSX(ltv)}
      textColor={getColorByPercent(ltv, HealthColorIncreasing)}
    />
  )
}

export const APRCell: FC<{ loan: coreNew.Loan }> = ({ loan }) => {
  const isTerminatingStatus = isLoanTerminating(loan)

  const apr = isTerminatingStatus
    ? calculateLenderApr(loan)
    : loan.bondTradeTransaction.amountOfBonds

  return <HorizontalCell value={createPercentValueJSX(apr.toNumber() / 100)} isHighlighted />
}
