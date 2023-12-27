import { FC } from 'react'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { createPercentValueJSX } from '@banx/components/TableComponents'

import { MarketPreview, Offer } from '@banx/api/core'
import { HealthColorIncreasing, formatDecimal, getColorByPercent } from '@banx/utils'

import { MAX_APR_VALUE, MIN_APR_VALUE } from './constants'
import { getSummaryInfo } from './helpers'

import styles from '../../PlaceOfferContent.module.less'

interface OfferSummaryProps {
  initialOffer: Offer | undefined
  updatedOffer: Offer | undefined
  market: MarketPreview | undefined
  isProMode: boolean
  hasFormChanges: boolean
}

export const Summary: FC<OfferSummaryProps> = ({
  initialOffer,
  updatedOffer,
  market,
  isProMode,
  hasFormChanges,
}) => {
  const {
    weeklyInterest,
    initialLoansQuantity,
    currentLtv,
    maxLtv,
    accruedInterest,
    lentValue,
    updatedOfferSize,
    initialOfferSize,
  } = getSummaryInfo({ initialOffer, updatedOffer, market })

  const offerSize = hasFormChanges ? updatedOfferSize : initialOfferSize

  const formattedOfferSize = formatDecimal(offerSize / 1e9)
  const formattedLentValue = formatDecimal(lentValue / 1e9)
  const formattedWeeklyInterestValue = formatDecimal(weeklyInterest / 1e9)

  const displayAprRange = `${MIN_APR_VALUE} - ${MAX_APR_VALUE}%`

  return (
    <div className={styles.summary}>
      {initialOffer && (
        <StatInfo
          label="Max / current LTV"
          value={createLtvValuesJSX({ maxLtv, currentLtv })}
          tooltipText="Max / current LTV"
          valueType={VALUES_TYPES.STRING}
          flexType="row"
        />
      )}

      {!initialOffer && (
        <StatInfo
          label={isProMode ? 'Max weighted LTV' : 'LTV'}
          value={currentLtv}
          valueStyles={{ color: getColorByPercent(currentLtv, HealthColorIncreasing) }}
          tooltipText={isProMode ? 'Average LTV offered by your pool' : ''}
          valueType={VALUES_TYPES.PERCENT}
          flexType="row"
        />
      )}

      {!initialOffer && (
        <StatInfo
          label="Pool size"
          value={`${formattedOfferSize}◎`}
          valueType={VALUES_TYPES.STRING}
          flexType="row"
        />
      )}

      <StatInfo
        label="Max weekly interest"
        value={`${formattedWeeklyInterestValue}◎`}
        valueType={VALUES_TYPES.STRING}
        flexType="row"
      />

      {!initialOffer && (
        <StatInfo
          label="Apr"
          value={displayAprRange}
          valueType={VALUES_TYPES.STRING}
          flexType="row"
        />
      )}

      {initialOffer && (
        <div className={styles.editSummary}>
          <StatInfo
            label="Lent"
            value={`${formattedLentValue} / ${formattedOfferSize}◎`}
            valueType={VALUES_TYPES.STRING}
          />
          <StatInfo label="Loans" value={initialLoansQuantity} valueType={VALUES_TYPES.STRING} />
          <StatInfo
            label="Accrued interest"
            value={`${formatDecimal(accruedInterest / 1e9)}◎`}
            valueType={VALUES_TYPES.STRING}
          />
          <StatInfo label="Apr" value={displayAprRange} valueType={VALUES_TYPES.STRING} />
        </div>
      )}
    </div>
  )
}

const createLtvValuesJSX = ({ currentLtv, maxLtv }: { currentLtv: number; maxLtv: number }) => (
  <div className={styles.ltvValues}>
    <span style={{ color: getColorByPercent(maxLtv, HealthColorIncreasing) }}>
      {createPercentValueJSX(maxLtv, '0%')}
    </span>
    {' / '}
    <span style={{ color: getColorByPercent(currentLtv, HealthColorIncreasing) }}>
      {createPercentValueJSX(currentLtv, '0%')}
    </span>
  </div>
)
