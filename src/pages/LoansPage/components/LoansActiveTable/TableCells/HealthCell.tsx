import { FC } from 'react'

import { createPercentValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { calculateLoanRepayValue } from '@banx/utils'

interface HealthCellProps {
  loan: Loan
}

export const HealthCell: FC<HealthCellProps> = ({ loan }) => {
  const collectionFloor = loan.nft.collectionFloor

  const repayValue = calculateLoanRepayValue(loan)

  const health = (1 - repayValue / collectionFloor) * 100

  return createPercentValueJSX(health)
}
