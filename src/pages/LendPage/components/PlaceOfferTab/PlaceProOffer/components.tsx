import { FC } from 'react'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { Offer } from '@banx/api/core'
import { WEEKS_IN_YEAR } from '@banx/constants'
import { HealthColorIncreasing, formatDecimal, getColorByPercent } from '@banx/utils'

import { getAdditionalSummaryOfferInfo } from '../helpers'

import styles from './PlaceProOffer.module.less'

interface OfferSummaryProps {
  offerSize: number
  marketApr: number //? rateBasePoints
  isEditMode: boolean
  offer: Offer | undefined
}

//TODO: Need to calc in the future
const MOCK_WEIGHTED_LTV = 50

export const OfferSummary: FC<OfferSummaryProps> = ({
  offer,
  offerSize,
  marketApr,
  isEditMode,
}) => {
  const formattedOfferSize = offerSize / 1e9
  const weightedWeeklyInterest = calculateWeightedWeeklyInterest(offerSize, marketApr)

  const colorLTV = getColorByPercent(MOCK_WEIGHTED_LTV, HealthColorIncreasing)

  const { accruedInterest, reserve, quantityOfLoans } = getAdditionalSummaryOfferInfo(offer)

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
            value={`${quantityOfLoans} / ${quantityOfLoans}`}
            valueType={VALUES_TYPES.STRING}
          />
          <StatInfo label="Reserve" value={reserve} tooltipText="Reserve" divider={1e9} />
          <StatInfo label="Accrued interest" value={accruedInterest} divider={1e9} />
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
