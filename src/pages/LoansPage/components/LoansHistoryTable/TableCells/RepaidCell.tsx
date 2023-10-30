import { FC } from 'react'

import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { BorrowerActivity } from '@banx/api/activity'
import { formatDecimal } from '@banx/utils'

interface RepaidCellProps {
  loan: BorrowerActivity
}

export const RepaidCell: FC<RepaidCellProps> = ({ loan }) => {
  const { repaid, status } = loan

  if (status === BondTradeTransactionV2State.PerpetualLiquidatedByClaim) {
    return <>Collateral</>
  }

  return createSolValueJSX(repaid, 1e9, '--', formatDecimal)
}
