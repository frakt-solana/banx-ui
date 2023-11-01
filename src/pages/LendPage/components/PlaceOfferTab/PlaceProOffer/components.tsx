import { FC } from 'react'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { WEEKS_IN_YEAR } from '@banx/constants'
import { HealthColorIncreasing, getColorByPercent } from '@banx/utils'

import styles from './PlaceProOffer.module.less'

interface OfferSummaryProps {
  offerSize: number
  marketApr: number //? rateBasePoints
}

export const OfferSummary: FC<OfferSummaryProps> = ({ offerSize, marketApr }) => {
  const weightedLtv = 50

  const weeklyAprPercentage = marketApr / 100 / WEEKS_IN_YEAR
  const weightedWeeklyInterest = (offerSize * weeklyAprPercentage) / 100

  const colorLTV = getColorByPercent(weightedLtv, HealthColorIncreasing)

  return (
    <div className={styles.offerSummary}>
      <StatInfo
        label="Weighted LTV"
        value={weightedLtv}
        valueStyles={{ color: colorLTV }}
        flexType="row"
        tooltipText="Weighted LTV"
        valueType={VALUES_TYPES.PERCENT}
      />
      <StatInfo flexType="row" label="Offer size" value={offerSize} divider={1e9} />
      <StatInfo
        flexType="row"
        label="Weighted weekly interest"
        value={weightedWeeklyInterest}
        divider={1e9}
      />
    </div>
  )
}
