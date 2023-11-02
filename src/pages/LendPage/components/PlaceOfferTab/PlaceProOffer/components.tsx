import { FC } from 'react'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { WEEKS_IN_YEAR } from '@banx/constants'
import { HealthColorIncreasing, formatDecimal, getColorByPercent } from '@banx/utils'

import styles from './PlaceProOffer.module.less'

interface OfferSummaryProps {
  offerSize: number
  marketApr: number //? rateBasePoints
}

export const OfferSummary: FC<OfferSummaryProps> = ({ offerSize, marketApr }) => {
  //TODO: Need tp calc weighted ltv or calcl as started ltv
  const weightedLtv = 50

  const formattedOfferSize = offerSize / 1e9 || 0

  const weeklyAprPercentage = marketApr / 100 / WEEKS_IN_YEAR
  const weightedWeeklyInterest = (formattedOfferSize * weeklyAprPercentage) / 100

  const colorLTV = getColorByPercent(weightedLtv, HealthColorIncreasing)

  const displayOfferSize = formattedOfferSize ? formatDecimal(formattedOfferSize) : 0
  const displayWeightedWeeklyInterest = weightedWeeklyInterest
    ? formatDecimal(weightedWeeklyInterest)
    : 0

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
      <StatInfo
        label="Offer size"
        value={`${displayOfferSize}◎`}
        flexType="row"
        valueType={VALUES_TYPES.STRING}
      />
      <StatInfo
        flexType="row"
        label="Weighted weekly interest"
        value={`${displayWeightedWeeklyInterest}◎`}
        valueType={VALUES_TYPES.STRING}
      />
    </div>
  )
}
