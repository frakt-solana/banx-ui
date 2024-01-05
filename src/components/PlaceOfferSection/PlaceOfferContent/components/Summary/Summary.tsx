import { FC } from 'react'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { createPercentValueJSX, createSolValueJSX } from '@banx/components/TableComponents'

import { MarketPreview, Offer } from '@banx/api/core'
import {
  HealthColorIncreasing,
  calcDynamicApr,
  formatDecimal,
  getColorByPercent,
} from '@banx/utils'

import { getSummaryInfo } from './helpers'

import styles from '../../PlaceOfferContent.module.less'

interface OfferSummaryProps {
  initialOffer: Offer | undefined
  updatedOffer: Offer | undefined
  market: MarketPreview | undefined
  hasFormChanges: boolean
}

export const Summary: FC<OfferSummaryProps> = ({
  initialOffer,
  updatedOffer,
  market,
  hasFormChanges,
}) => {
  const { weeklyInterest, maxLtv, offerSize, collectionFloor, maxOfferValue } = getSummaryInfo({
    hasFormChanges,
    initialOffer,
    updatedOffer,
    market,
  })

  const formattedOfferSize = formatDecimal(offerSize / 1e9)
  const formattedWeeklyInterestValue = formatDecimal(weeklyInterest / 1e9)

  const maxDynamicApr = calcDynamicApr(maxOfferValue, collectionFloor)

  return (
    <div className={styles.summary}>
      <StatInfo
        label="Max offer | Max LTV"
        value={createLtvValuesJSX({ maxOfferValue, maxLtv })}
        tooltipText="Max offer given sufficient pool liquidity | Top offer given current pool liquidity"
        valueType={VALUES_TYPES.STRING}
        flexType="row"
      />

      <StatInfo
        label="In offer"
        value={`${formattedOfferSize}◎`}
        valueType={VALUES_TYPES.STRING}
        flexType="row"
      />

      <StatInfo
        label="Max Apr"
        value={maxDynamicApr}
        valueType={VALUES_TYPES.PERCENT}
        flexType="row"
      />

      <StatInfo
        label="Max weekly interest"
        value={`${formattedWeeklyInterestValue}◎`}
        valueType={VALUES_TYPES.STRING}
        tooltipText="Max weekly interest if all pool offers are taken at Max LTV"
        flexType="row"
      />
    </div>
  )
}

const createLtvValuesJSX = ({
  maxLtv,
  maxOfferValue,
}: {
  maxLtv: number
  maxOfferValue: number
}) => (
  <div className={styles.ltvValues}>
    {createSolValueJSX(maxOfferValue, 1e9, '0◎')}
    {' | '}
    <span style={{ color: getColorByPercent(maxLtv, HealthColorIncreasing) }}>
      {createPercentValueJSX(maxLtv, '0%')}
    </span>
  </div>
)
