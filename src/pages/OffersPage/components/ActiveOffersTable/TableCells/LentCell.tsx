import { FC } from 'react'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { formatDecimal } from '@banx/utils'

interface LentCellProps {
  loan: Loan
}

export const LentCell: FC<LentCellProps> = ({ loan }) => {
  // const { currentPerpetualBorrowed } = loan.fraktBond || {}
  const totalLent = loan.bondTradeTransaction
    ? loan.bondTradeTransaction.solAmount + loan.bondTradeTransaction.feeAmount
    : 0

  const formattedLentValue = createSolValueJSX(totalLent, 1e9, '0◎', formatDecimal)

  return formattedLentValue
}
