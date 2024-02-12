import { FC } from 'react'

import { HorizontalCell, createPercentValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { HealthColorIncreasing, calculateLoanRepayValue, getColorByPercent } from '@banx/utils'

interface LTVCellProps {
  loan: Loan
}

export const LTVCell: FC<LTVCellProps> = ({ loan }) => {
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
