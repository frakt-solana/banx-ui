import { FC } from 'react'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { WEEKS_IN_YEAR } from '@banx/constants'
import { HealthColorIncreasing, formatDecimal, getColorByPercent } from '@banx/utils'

import styles from './PlaceLiteOffer.module.less'

interface OfferSummaryProps {
  offerSize: number
  marketAPR: number
  loanToValuePercent: number
  isEditMode: boolean
}

export const OfferSummary: FC<OfferSummaryProps> = ({
  offerSize,
  marketAPR,
  loanToValuePercent,
  isEditMode,
}) => {
  const weeklyAprPercentage = marketAPR / 100 / WEEKS_IN_YEAR
  const estimatedInterest = (offerSize * weeklyAprPercentage) / 100

  const colorLTV = getColorByPercent(loanToValuePercent, HealthColorIncreasing)

  const displayEstimatedInterest = estimatedInterest ? formatDecimal(estimatedInterest) : 0
  const displayOfferSize = offerSize ? formatDecimal(offerSize) : 0

  return (
    <div className={styles.offerSummary}>
      <StatInfo
        label="LTV"
        value={loanToValuePercent}
        valueStyles={{ color: colorLTV }}
        flexType="row"
        valueType={VALUES_TYPES.PERCENT}
      />
      <StatInfo
        label="Offer size"
        value={`${displayOfferSize}◎`}
        flexType="row"
        valueType={VALUES_TYPES.STRING}
      />
      <StatInfo
        label="Weekly interest"
        value={`${displayEstimatedInterest}◎`}
        valueType={VALUES_TYPES.STRING}
        flexType="row"
      />
      {isEditMode && (
        <div className={styles.editOfferSummary}>
          <StatInfo label="Active loans" value={'2 / 3'} valueType={VALUES_TYPES.STRING} />
          <StatInfo label="Reserve" value={3} tooltipText="Reserve" />
          <StatInfo label="Accrued interest" value={12.5} />
        </div>
      )}
    </div>
  )
}
