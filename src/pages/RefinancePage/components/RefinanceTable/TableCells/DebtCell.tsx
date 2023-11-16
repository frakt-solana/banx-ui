import { FC } from 'react'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { calculateLoanRepayValue, formatDecimal } from '@banx/utils'

export const DebtCell: FC<{ loan: Loan }> = ({ loan }) => {
  const repayValue = calculateLoanRepayValue(loan)

  return createSolValueJSX(repayValue, 1e9, '--', formatDecimal)
}
