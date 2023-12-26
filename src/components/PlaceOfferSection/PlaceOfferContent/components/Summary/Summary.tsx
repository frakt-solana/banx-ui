import { FC } from 'react'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { createPercentValueJSX } from '@banx/components/TableComponents'

import { MarketPreview, Offer } from '@banx/api/core'
import { HealthColorIncreasing, formatDecimal, getColorByPercent } from '@banx/utils'

import { MAX_APR_VALUE, MIN_APR_VALUE } from './constants'
import { caclWeeklyInterest, calcOfferSize, getSummaryInfo } from './helpers'

import styles from '../../PlaceOfferContent.module.less'

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
  hasFormChanges,
  isProMode,
}) => {
  console.log(offer, 'offer')
  const { collectionFloor = 0 } = market || {}

  const { offerSize, weeklyInterest, initialLoansQuantity } = getSummaryInfo({
    initialOffer: offer,
    updatedOffer: offer,
    market,
    hasFormChanges,
  })

  const { concentrationIndex: accruedInterest = 0, edgeSettlement: lentValue = 0 } = offer || {}

  const ltv = (offerSize / loansQuantity / collectionFloor) * 100

  const formattedMaxLtv = isFinite(ltv) && ltv > 0 ? ltv : 0
  const formattedOfferSize = formatDecimal(offerSize / 1e9)
  const formattedLentValue = formatDecimal(lentValue / 1e9)

  return (
    <div className={styles.summary}>
      <StatInfo
        label="Max / current LTV"
        value={createLtvValuesJSX(ltv, ltv)}
        tooltipText="Max / current LTV"
        valueType={VALUES_TYPES.STRING}
        flexType="row"
      />
      <StatInfo
        label={isProMode ? 'Max weighted LTV' : 'LTV'}
        value={formattedMaxLtv}
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
      {!isEditMode && (
        <StatInfo
          flexType="row"
          label="Apr"
          value={`${MIN_APR_VALUE} - ${MAX_APR_VALUE}%`}
          valueType={VALUES_TYPES.STRING}
        />
      )}

      {isEditMode && (
        <div className={styles.editSummary}>
          <StatInfo
            label="Lent"
            value={`${formattedLentValue} / ${formattedOfferSize}◎`}
            valueType={VALUES_TYPES.STRING}
          />
          <StatInfo label="Loan" value={initialLoansQuantity} valueType={VALUES_TYPES.STRING} />
          <StatInfo
            label="Accrued interest"
            value={`${formatDecimal(accruedInterest / 1e9)}◎`}
            valueType={VALUES_TYPES.STRING}
          />
          <StatInfo
            label="Apr"
            value={`${MIN_APR_VALUE} - ${MAX_APR_VALUE}%`}
            valueType={VALUES_TYPES.STRING}
          />
        </div>
      )}
    </div>
  )
}

const createLtvValuesJSX = (maxLtv: number, currentLtv: number) => (
  <div className={styles.ltvValues}>
    <span style={{ color: getColorByPercent(maxLtv, HealthColorIncreasing) }}>
      {createPercentValueJSX(maxLtv)}
    </span>
    {' / '}
    <span style={{ color: getColorByPercent(currentLtv, HealthColorIncreasing) }}>
      {createPercentValueJSX(currentLtv)}
    </span>
  </div>
)
