import { FC } from 'react'

import { createPercentValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { HealthColorIncreasing, calculateLoanRepayValue, getColorByPercent } from '@banx/utils'

interface LTVCellProps {
  loan: Loan
}

export const LTVCell: FC<LTVCellProps> = ({ loan }) => {
  const repayValue = calculateLoanRepayValue(loan)

  const collectionFloor = loan.nft.collectionFloor
  const ltv = (repayValue / collectionFloor) * 100

  const colorLTV = getColorByPercent(ltv, HealthColorIncreasing)

  return <span style={{ color: colorLTV }}>{createPercentValueJSX(ltv)} LTV</span>
}
