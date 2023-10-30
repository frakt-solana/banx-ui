import { FC } from 'react'

import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { LenderActivity } from '@banx/api/activity'
import { formatDecimal } from '@banx/utils'

interface ReceivedCellProps {
  loan: LenderActivity
}

export const ReceivedCell: FC<ReceivedCellProps> = ({ loan }) => {
  const { received, status } = loan

  if (status === BondTradeTransactionV2State.PerpetualLiquidatedByClaim) {
    return <>Collateral</>
  }

  return createSolValueJSX(received, 1e9, '--', formatDecimal)
}
