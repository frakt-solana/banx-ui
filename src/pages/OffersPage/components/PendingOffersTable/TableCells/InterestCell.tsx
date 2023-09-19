import { FC } from 'react'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { TableUserOfferData } from '../helpers'

interface InterestCellProps {
  offer: TableUserOfferData
}

const WEEKS_IN_YEAR = 52

export const InterestCell: FC<InterestCellProps> = ({ offer }) => {
  const { size, apr } = offer

  const weeklyAprPercentage = apr / WEEKS_IN_YEAR
  const estimatedInterest = (size * weeklyAprPercentage) / 100

  return createSolValueJSX(estimatedInterest, 1e9)
}
