import { FC } from 'react'

import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'

import { DisplayValue, HorizontalCell } from '@banx/components/TableComponents'

import { activity } from '@banx/api/nft'

interface ReceivedCellProps {
  loan: activity.LenderActivity
}

export const ReceivedCell: FC<ReceivedCellProps> = ({ loan }) => {
  const { received, status } = loan

  if (status === BondTradeTransactionV2State.PerpetualLiquidatedByClaim) {
    return <HorizontalCell value="Collateral" />
  }

  return <HorizontalCell value={<DisplayValue value={received} placeholder="--" />} />
}
