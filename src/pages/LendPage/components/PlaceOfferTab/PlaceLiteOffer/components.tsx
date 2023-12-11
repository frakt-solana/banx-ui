import { FC } from 'react'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { Offer } from '@banx/api/core'
import { WEEKS_IN_YEAR } from '@banx/constants'
import { HealthColorIncreasing, formatDecimal, getColorByPercent } from '@banx/utils'

import styles from './PlaceLiteOffer.module.less'

interface OfferSummaryProps {
  offerSize: number
  marketAPR: number
  loanToValuePercent: number
  isEditMode: boolean
  offer: Offer | undefined
}

export const OfferSummary: FC<OfferSummaryProps> = ({
  offerSize,
  marketAPR,
  loanToValuePercent,
  isEditMode,
  offer,
}) => {
  const { concentrationIndex: accruedInterest = 0, edgeSettlement: lentValue = 0 } = offer || {}

  const weeklyAprPercentage = marketAPR / 100 / WEEKS_IN_YEAR
  const estimatedInterest = ((offerSize / 1e9) * weeklyAprPercentage) / 100

  const colorLTV = getColorByPercent(loanToValuePercent, HealthColorIncreasing)

  const displayEstimatedInterest = formatDecimal(estimatedInterest)
  const displayOfferSize = formatDecimal(offerSize / 1e9)
  const displayLentValue = formatDecimal(lentValue / 1e9)

  return (
    <div className={styles.offerSummary}>
      <StatInfo
        label="Max LTV"
        value={loanToValuePercent}
        valueStyles={{ color: colorLTV }}
        flexType="row"
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
        label="Max weekly interest"
        value={`${displayEstimatedInterest}◎`}
        valueType={VALUES_TYPES.STRING}
        flexType="row"
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
