import { FC } from 'react'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { MarketPreview, Offer } from '@banx/api/core'
import { WEEKS_IN_YEAR } from '@banx/constants'
import { HealthColorIncreasing, formatDecimal, getColorByPercent } from '@banx/utils'

import styles from './PlaceProOffer.module.less'

interface OfferSummaryProps {
  offerSize: number
  isEditMode: boolean
  offer: Offer | undefined
  market?: MarketPreview
  loansAmount: number
}

export const OfferSummary: FC<OfferSummaryProps> = ({
  offer,
  offerSize,
  isEditMode,
  market,
  loansAmount,
}) => {
  const { collectionFloor = 0, marketApr = 0 } = market || {}
  const { concentrationIndex: accruedInterest = 0, edgeSettlement: lentValue = 0 } = offer || {}

  const weeklyInterest = calculateWeeklyInterest(offerSize, marketApr)
  const weightedLtv = (offerSize / loansAmount / collectionFloor) * 100
  const colorLTV = getColorByPercent(weightedLtv, HealthColorIncreasing)

  const displayOfferSize = formatDecimal(offerSize / 1e9)
  const displayLentValue = formatDecimal(lentValue / 1e9)

  return (
    <div className={styles.offerSummary}>
      <StatInfo
        label="Max weighted LTV"
        value={weightedLtv || 0}
        valueStyles={{ color: colorLTV }}
        flexType="row"
        tooltipText="Average LTV offered by your pool"
        valueType={VALUES_TYPES.PERCENT}
      />
      {!isEditMode && (
        <StatInfo
          label="Pool size"
          value={`${displayOfferSize}◎`}
          flexType="row"
          valueType={VALUES_TYPES.STRING}
        />
      )}
      <StatInfo
        flexType="row"
        label="Max weekly interest"
        value={`${formatDecimal(weeklyInterest / 1e9)}◎`}
        valueType={VALUES_TYPES.STRING}
      />
      {isEditMode && (
        <div className={styles.editOfferSummary}>
          <StatInfo
            label="Lent / size"
            value={`${displayLentValue}/${displayOfferSize}◎`}
            valueType={VALUES_TYPES.STRING}
          />
          <StatInfo
            label="Accrued interest"
            value={`${formatDecimal(accruedInterest / 1e9)}◎`}
            valueType={VALUES_TYPES.STRING}
          />
        </div>
      )}
    </div>
  )
}

const calculateWeeklyInterest = (offerSize: number, marketApr: number) => {
  const weeklyAprPercentage = marketApr / 100 / WEEKS_IN_YEAR
  const weightedWeeklyInterest = (offerSize * weeklyAprPercentage) / 100

  return weightedWeeklyInterest
}
