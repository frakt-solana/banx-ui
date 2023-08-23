import { FC } from 'react'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { TableUserOfferData } from '../helpers'

interface InterestCellProps {
  offer: TableUserOfferData
}

const WEEKS_IN_YEAR = 52
const MARKET_APR = 10400 // TODO: need take value from BE

export const InterestCell: FC<InterestCellProps> = ({ offer }) => {
  const { size } = offer

  const weeklyAprPercentage = MARKET_APR / 100 / WEEKS_IN_YEAR
  const estimatedInterest = (size * weeklyAprPercentage) / 100

  return createSolValueJSX(estimatedInterest, 1e9)
}
