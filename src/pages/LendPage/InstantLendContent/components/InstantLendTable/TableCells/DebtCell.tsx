import { FC } from 'react'

import { DisplayValue, HorizontalCell } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { calculateLoanRepayValue } from '@banx/utils'

import styles from '../RefinanceTable.module.less'

interface DebtCellProps {
  loan: Loan
}

export const DebtCell: FC<DebtCellProps> = ({ loan }) => {
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
