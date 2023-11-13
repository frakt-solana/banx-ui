import { FC } from 'react'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { formatDecimal } from '@banx/utils'

interface LentCellProps {
  loan: Loan
}

export const LentCell: FC<LentCellProps> = ({ loan }) => {
  const { bondTradeTransaction, totalRepaidAmount = 0 } = loan
  const { solAmount, feeAmount } = loan.bondTradeTransaction

  const totalLent = bondTradeTransaction ? solAmount + feeAmount + totalRepaidAmount : 0

  const formattedLentValue = createSolValueJSX(totalLent, 1e9, '0◎', formatDecimal)

  return formattedLentValue
}
