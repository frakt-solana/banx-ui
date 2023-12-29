import { FC } from 'react'

import { MIN_APR_VALUE } from '@banx/components/PlaceOfferSection/constants'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { createPercentValueJSX } from '@banx/components/TableComponents'

import { MarketPreview, Offer } from '@banx/api/core'
import { HealthColorIncreasing, formatDecimal, getColorByPercent } from '@banx/utils'

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
    currentLtv,
    maxLtv,
    accruedInterest,
    offerSize,
    dinamicLtvWithDelta,
    // collectionFloor,
    // bestLoanValue,
  } = getSummaryInfo({ initialOffer, updatedOffer, market, hasFormChanges })

  const formattedOfferSize = formatDecimal(offerSize / 1e9)
  const formattedWeeklyInterestValue = formatDecimal(weeklyInterest / 1e9)

  // const maxDynamicApr = calcDynamicApr(bestLoanValue, collectionFloor)
  // const displayAprRange = `${MIN_APR_VALUE} - ${maxDynamicApr?.toFixed(0)}%`

  return (
    <div className={styles.summary}>
      {initialOffer && (
        <StatInfo
          label="Max LTV | current"
          value={createLtvValuesJSX({ maxLtv, currentLtv })}
          tooltipText="Max offer given sufficient pool liquidity / Top offer given current pool liquidity"
          valueType={VALUES_TYPES.STRING}
          flexType="row"
        />
      )}

      {!initialOffer && isProMode && (
        <StatInfo
          label="Max weighted LTV"
          value={dinamicLtvWithDelta}
          valueStyles={{ color: getColorByPercent(dinamicLtvWithDelta, HealthColorIncreasing) }}
          tooltipText="Average LTV offered by your pool"
          valueType={VALUES_TYPES.PERCENT}
          flexType="row"
        />
      )}

      {!initialOffer && !isProMode && (
        <StatInfo
          label="LTV"
          value={currentLtv}
          valueStyles={{ color: getColorByPercent(currentLtv, HealthColorIncreasing) }}
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
        tooltipText="Max weekly interest if all pool offers are taken at Max LTV"
        flexType="row"
      />

      {initialOffer && (
        <StatInfo
          label="Accrued interest"
          value={`${formatDecimal(accruedInterest / 1e9)}◎`}
          tooltipText="Total accrued interest available to harvest"
          valueType={VALUES_TYPES.STRING}
          flexType="row"
        />
      )}

      <StatInfo label="Apr" value={MIN_APR_VALUE} valueType={VALUES_TYPES.PERCENT} flexType="row" />
    </div>
  )
}

const createLtvValuesJSX = ({ currentLtv, maxLtv }: { currentLtv: number; maxLtv: number }) => (
  <div className={styles.ltvValues}>
    <span style={{ color: getColorByPercent(maxLtv, HealthColorIncreasing) }}>
      {createPercentValueJSX(maxLtv, '0%')}
    </span>
    {' | '}
    <span style={{ color: getColorByPercent(currentLtv, HealthColorIncreasing) }}>
      {createPercentValueJSX(currentLtv, '0%')}
    </span>
  </div>
)
