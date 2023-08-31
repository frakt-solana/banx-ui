import { FC } from 'react'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { LenderActivity } from '@banx/api/core'

interface ReceivedCellProps {
  loan: LenderActivity
}

export const ReceivedCell: FC<ReceivedCellProps> = ({ loan }) => {
  return createSolValueJSX(loan.received, 1e9)
}
