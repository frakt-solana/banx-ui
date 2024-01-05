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
  const maxDynamicApr = calcDynamicApr(maxOfferValue, collectionFloor)

  const maxOfferValuesJSX = (
    <div className={styles.ltvValues}>
      {createSolValueJSX(maxOfferValue, 1e9, '0◎', formatDecimal)}
      {' | '}
      <span style={{ color: getColorByPercent(maxLtv, HealthColorIncreasing) }}>
        {createPercentValueJSX(maxLtv, '0%')}
      </span>
    </div>
  )

  const interestValuesJSX = (
    <>
      {createSolValueJSX(weeklyInterest, 1e9, '0◎', formatDecimal)}
      {' | '}
      <span className={styles.aprValue}>{createPercentValueJSX(maxDynamicApr, '0%')}</span>
    </>
  )

  return (
    <div className={styles.summary}>
      <StatInfo
        label="Max offer | LTV"
        value={maxOfferValuesJSX}
        tooltipText="Max offer given sufficient pool liquidity | Top offer given current pool liquidity"
        valueType={VALUES_TYPES.STRING}
        flexType="row"
      />

      <StatInfo
        label="In offer"
        value={`${formattedOfferSize}◎`}
        valueType={VALUES_TYPES.STRING}
        tooltipText="Total liquidity currently available in offer"
        flexType="row"
      />

      <StatInfo
        label="Max weekly interest | Apr"
        value={interestValuesJSX}
        valueType={VALUES_TYPES.STRING}
        tooltipText="Max weekly interest if all pool offers are taken at Max LTV | Max annual interest rate"
        flexType="row"
      />
    </div>
  )
}
