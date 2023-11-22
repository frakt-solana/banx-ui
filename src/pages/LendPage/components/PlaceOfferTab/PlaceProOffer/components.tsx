import { FC } from 'react'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { WEEKS_IN_YEAR } from '@banx/constants'
import { HealthColorIncreasing, formatDecimal, getColorByPercent } from '@banx/utils'

import styles from './PlaceProOffer.module.less'

interface OfferSummaryProps {
  offerSize: number
  marketApr: number //? rateBasePoints
  isEditMode: boolean
}

//TODO: Need to calc in the future
const MOCK_WEIGHTED_LTV = 50
const MOCK_ACTIVE_LOANS = 2
const MOCK_TOTAL_LOANS = 3
const MOCK_RESERVE_VALUE = 3
const MOCK_ACCRUED_INTEREST = 2.5

export const OfferSummary: FC<OfferSummaryProps> = ({ offerSize, marketApr, isEditMode }) => {
  const formattedOfferSize = offerSize / 1e9

  const weightedWeeklyInterest = calculateWeightedWeeklyInterest(offerSize, marketApr)

  const colorLTV = getColorByPercent(MOCK_WEIGHTED_LTV, HealthColorIncreasing)

  return (
    <div className={styles.offerSummary}>
      <StatInfo
        label="Weighted LTV"
        value={MOCK_WEIGHTED_LTV}
        valueStyles={{ color: colorLTV }}
        flexType="row"
        tooltipText="Weighted LTV"
        valueType={VALUES_TYPES.PERCENT}
      />
      <StatInfo
        label="Offer size"
        value={`${formatDecimal(formattedOfferSize)}◎`}
        flexType="row"
        valueType={VALUES_TYPES.STRING}
      />
      <StatInfo
        flexType="row"
        label="Weighted weekly interest"
        value={`${formatDecimal(weightedWeeklyInterest)}◎`}
        valueType={VALUES_TYPES.STRING}
      />
      {isEditMode && (
        <div className={styles.editOfferSummary}>
          <StatInfo
            label="Active loans"
            value={`${MOCK_ACTIVE_LOANS} / ${MOCK_TOTAL_LOANS}`}
            valueType={VALUES_TYPES.STRING}
          />
          <StatInfo label="Reserve" value={MOCK_RESERVE_VALUE} tooltipText="Reserve" />
          <StatInfo label="Accrued interest" value={MOCK_ACCRUED_INTEREST} />
        </div>
      )}
    </div>
  )
}

const calculateWeightedWeeklyInterest = (offerSize: number, marketApr: number) => {
  const weeklyAprPercentage = marketApr / 100 / WEEKS_IN_YEAR
  const weightedWeeklyInterest = (offerSize * weeklyAprPercentage) / 100

  return weightedWeeklyInterest / 1e9
}
