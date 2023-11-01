import { FC } from 'react'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { HealthColorIncreasing, getColorByPercent } from '@banx/utils'

import styles from './PlaceProOffer.module.less'

interface OfferSummaryProps {}

export const OfferSummary: FC<OfferSummaryProps> = () => {
  const weightedLtv = 50
  const offerSize = 210
  const weightedWeeklyInterest = 4.42

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
      <StatInfo label="Offer size" value={offerSize} flexType="row" />
      <StatInfo label="Weighted weekly interest" value={weightedWeeklyInterest} flexType="row" />
    </div>
  )
}
