import { FC } from 'react'

import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'

import { DisplayValue, HorizontalCell } from '@banx/components/TableComponents'

import { BorrowerActivity } from '@banx/api/activity'

interface RepaidCellProps {
  loan: BorrowerActivity
}

export const RepaidCell: FC<RepaidCellProps> = ({ loan }) => {
  const { repaid, status } = loan

  if (status === BondTradeTransactionV2State.PerpetualLiquidatedByClaim) {
    return <HorizontalCell value="Collateral" />
  }

  return <HorizontalCell value={<DisplayValue value={repaid} placeholder="--" />} />
}
