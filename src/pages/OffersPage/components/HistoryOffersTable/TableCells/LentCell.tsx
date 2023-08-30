import { FC } from 'react'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'

interface LentCellProps {
  loan: Loan
}

export const LentCell: FC<LentCellProps> = ({ loan }) => {
  const { solAmount, feeAmount } = loan.bondTradeTransaction || {}

  const lentValue = solAmount + feeAmount

  return createSolValueJSX(lentValue, 1e9)
}
