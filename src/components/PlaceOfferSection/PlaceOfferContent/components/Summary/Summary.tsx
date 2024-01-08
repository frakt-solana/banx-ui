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
  const { maxLtv, offerSize, collectionFloor, loansQuantity, maxOfferValue } = getSummaryInfo({
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

  return (
    <div className={styles.summary}>
      <StatInfo
        label="Maximum offer | LTV"
        value={maxOfferValuesJSX}
        tooltipText="Your max offer given sufficient liquidity in your offer. Actual loan amount taken can be less depending on the amount of SOL borrowers choose to borrow"
        valueType={VALUES_TYPES.STRING}
        flexType="row"
      />

      <StatInfo
        label="Funding at least"
        value={`${loansQuantity} loans`}
        tooltipText="Your minimum amount of loans you will fund if your entire liquidity in offer is lend at Max Offer. As borrowers can borrow at loan value equal or smaller than your max offer you could end up funding more loans"
        valueType={VALUES_TYPES.STRING}
        flexType="row"
      />

      <StatInfo
        label="Total liquidity in offer"
        value={`${formattedOfferSize}◎`}
        valueType={VALUES_TYPES.STRING}
        tooltipText="Your total liquidity currently available in offer"
        flexType="row"
      />

      <StatInfo
        label="Max Apr"
        value={maxDynamicApr}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={{ value: styles.aprValue }}
        tooltipText="Your maximum annual interest rate. Ranges between 34-104% APR depending on the loan-to-value (LTV) offered, and becomes fixed once offer is taken by a borrower"
        flexType="row"
      />
    </div>
  )
}
