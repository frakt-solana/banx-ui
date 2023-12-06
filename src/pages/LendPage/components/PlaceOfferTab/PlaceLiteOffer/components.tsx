import { FC } from 'react'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { Offer } from '@banx/api/core'
import { WEEKS_IN_YEAR } from '@banx/constants'
import { HealthColorIncreasing, formatDecimal, getColorByPercent } from '@banx/utils'

import { getAdditionalSummaryOfferInfo } from '../helpers'

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
  const formattedOfferSize = offerSize / 1e9

  const weeklyAprPercentage = marketAPR / 100 / WEEKS_IN_YEAR
  const estimatedInterest = (formattedOfferSize * weeklyAprPercentage) / 100

  const colorLTV = getColorByPercent(loanToValuePercent, HealthColorIncreasing)

  const { accruedInterest, reserve, activeLoansQuantity, totalLoansQuantity } =
    getAdditionalSummaryOfferInfo(offer)

  const displayEstimatedInterest = formatDecimal(estimatedInterest)
  const displayOfferSize = formatDecimal(formattedOfferSize)

  return (
    <div className={styles.offerSummary}>
      <StatInfo
        label="Max LTV"
        value={loanToValuePercent}
        valueStyles={{ color: colorLTV }}
        flexType="row"
        valueType={VALUES_TYPES.PERCENT}
      />
      <StatInfo
        label="Pool size"
        value={`${displayOfferSize}◎`}
        flexType="row"
        valueType={VALUES_TYPES.STRING}
      />
      <StatInfo
        label="Max weekly interest"
        value={`${displayEstimatedInterest}◎`}
        valueType={VALUES_TYPES.STRING}
        flexType="row"
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
            divider={1e9}
            tooltipText="Leftover SOL is sent here if offers are partially taken"
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
