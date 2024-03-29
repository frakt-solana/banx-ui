import { FC } from 'react'

import { HorizontalCell, createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { calculateLoanRepayValue, formatDecimal } from '@banx/utils'

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
    <HorizontalCell
      tooltipContent={tooltopContent}
      value={createSolValueJSX(repayValue, 1e9, '0◎', formatDecimal)}
    />
  )
}

const createTooltipContent = (label: string, value: number) => (
  <div className={styles.tooltipContent}>
    <span>{label}</span>
    <span>{createSolValueJSX(value, 1e9, '0◎', formatDecimal)}</span>
  </div>
)
