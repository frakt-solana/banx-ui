import { FC } from 'react'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { HealthColorIncreasing, getColorByPercent } from '@banx/utils'

import styles from './PlaceProOffer.module.less'

interface OfferSummaryProps {
  offerSize: number
}

export const OfferSummary: FC<OfferSummaryProps> = ({ offerSize }) => {
  const weightedLtv = 50
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
      <StatInfo label="Offer size" value={offerSize} flexType="row" divider={1e9} />
      <StatInfo label="Weighted weekly interest" value={weightedWeeklyInterest} flexType="row" />
    </div>
  )
}
