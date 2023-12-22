import { FC } from 'react'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { MarketPreview, Offer } from '@banx/api/core'
import { WEEKS_IN_YEAR } from '@banx/constants'
import { HealthColorIncreasing, formatDecimal, getColorByPercent } from '@banx/utils'

import styles from '../PlaceOfferContent.module.less'

interface OfferSummaryProps {
  offerSize: number
  isEditMode: boolean
  offer: Offer | undefined
  market?: MarketPreview
  loansQuantity: number
  isProMode: boolean
  hasFormChanges: boolean
}

export const Summary: FC<OfferSummaryProps> = ({
  offer,
  offerSize: updatedOfferSize,
  isEditMode,
  market,
  loansQuantity,
  isProMode,
  hasFormChanges,
}) => {
  const {
    concentrationIndex: accruedInterest = 0,
    edgeSettlement: lentValue = 0,
    fundsSolOrTokenBalance = 0,
    bidSettlement = 0,
  } = offer || {}
  const { collectionFloor = 0, marketApr = 0 } = market || {}

  const initialOfferSize = fundsSolOrTokenBalance + bidSettlement + lentValue
  const offerSize = hasFormChanges ? updatedOfferSize : initialOfferSize

  const weeklyAprPercentage = marketApr / 100 / WEEKS_IN_YEAR
  const weeklyInterest = (offerSize * weeklyAprPercentage) / 100

  const ltv = (offerSize / loansQuantity / collectionFloor) * 100

  const formattedLtvValue = isFinite(ltv) && ltv > 0 ? ltv : 0
  const formattedOfferSize = formatDecimal(offerSize / 1e9)
  const formattedLentValue = formatDecimal(lentValue / 1e9)

  return (
    <div className={styles.summary}>
      <StatInfo
        label={isProMode ? 'Max weighted LTV' : 'LTV'}
        value={formattedLtvValue}
        valueStyles={{ color: getColorByPercent(ltv, HealthColorIncreasing) }}
        flexType="row"
        tooltipText={isProMode ? 'Average LTV offered by your pool' : ''}
        valueType={VALUES_TYPES.PERCENT}
      />
      {!isEditMode && (
        <StatInfo
          label="Pool size"
          value={`${formattedOfferSize}◎`}
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
        <div className={styles.editSummary}>
          <StatInfo
            label="Lent/Pool size"
            value={`${formattedLentValue}/${formattedOfferSize}◎`}
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
