import { FC } from 'react'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { MarketPreview, Offer } from '@banx/api/core'
import { WEEKS_IN_YEAR } from '@banx/constants'
import { HealthColorIncreasing, formatDecimal, getColorByPercent } from '@banx/utils'

import { getAdditionalSummaryOfferInfo } from '../helpers'

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

  const { accruedInterest, reserve, activeLoansQuantity, totalLoansQuantity } =
    getAdditionalSummaryOfferInfo(offer)

  const weeklyInterest = calculateWeeklyInterest(offerSize, marketApr)
  const weightedLtv = (offerSize / loansAmount / collectionFloor) * 100
  const colorLTV = getColorByPercent(weightedLtv, HealthColorIncreasing)

  return (
    <div className={styles.offerSummary}>
      <StatInfo
        label="Weighted LTV"
        value={weightedLtv || 0}
        valueStyles={{ color: colorLTV }}
        flexType="row"
        tooltipText="Average LTV offered by your pool"
        valueType={VALUES_TYPES.PERCENT}
      />
      <StatInfo
        label="Offer size"
        value={`${formatDecimal(offerSize / 1e9)}◎`}
        flexType="row"
        valueType={VALUES_TYPES.STRING}
      />
      <StatInfo
        flexType="row"
        label="Weekly interest"
        value={`${formatDecimal(weeklyInterest / 1e9)}◎`}
        valueType={VALUES_TYPES.STRING}
      />
      {isEditMode && (
        <div className={styles.editOfferSummary}>
          <StatInfo
            label="Active loans"
            value={`${activeLoansQuantity}/${totalLoansQuantity}`}
            valueType={VALUES_TYPES.STRING}
          />
          <StatInfo
            label="Reserve"
            value={reserve}
            tooltipText="Leftover SOL is sent here if offers are partially taken"
            divider={1e9}
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
