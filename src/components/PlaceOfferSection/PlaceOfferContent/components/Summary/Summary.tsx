import { FC } from 'react'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { MarketPreview, Offer } from '@banx/api/core'
import {
  HealthColorIncreasing,
  calcDynamicApr,
  formatDecimal,
  getColorByPercent,
} from '@banx/utils'

import { calcMaxLtv, calcOfferSize } from './helpers'

import styles from './Summary.module.less'

interface OfferSummaryProps {
  initialOffer: Offer | undefined
  updatedOffer: Offer | undefined
  hasFormChanges: boolean
}

interface MainSummaryProps extends OfferSummaryProps {
  market: MarketPreview | undefined
}

export const MainSummary: FC<MainSummaryProps> = ({
  initialOffer,
  updatedOffer,
  market,
  hasFormChanges,
}) => {
  const { collectionFloor = 0 } = market || {}

  const initialMaxOfferValue = initialOffer?.validation.loanToValueFilter || 0
  const updatedMaxOfferValue = updatedOffer?.validation.loanToValueFilter || 0
  const maxOfferValue = Math.max(initialMaxOfferValue, updatedMaxOfferValue)

  const maxLtv = calcMaxLtv({ initialOffer, updatedOffer, collectionFloor, hasFormChanges })

  const maxDynamicApr = calcDynamicApr(maxOfferValue, collectionFloor)

  return (
    <div className={styles.mainSummary}>
      <StatInfo
        label="Max LTV"
        value={maxLtv}
        tooltipText="Your max offer given sufficient liquidity in your offer. Actual loan amount taken can be less depending on the amount of SOL borrowers choose to borrow"
        valueType={VALUES_TYPES.PERCENT}
        valueStyles={{ color: getColorByPercent(maxLtv, HealthColorIncreasing) }}
        classNamesProps={{ container: styles.mainSummaryStat }}
      />
      <div className={styles.separateLine} />
      <StatInfo
        label="Max Apr"
        value={maxDynamicApr}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={{ value: styles.aprValue, container: styles.mainSummaryStat }}
        tooltipText="Your maximum annual interest rate. Ranges between 34-104% APR depending on the loan-to-value (LTV) offered, and becomes fixed once offer is taken by a borrower"
      />
    </div>
  )
}

export const AdditionalSummary: FC<OfferSummaryProps> = ({
  initialOffer,
  updatedOffer,
  hasFormChanges,
}) => {
  const loansQuantity = updatedOffer?.buyOrdersQuantity || 0
  const offerSize = calcOfferSize({ initialOffer, updatedOffer, hasFormChanges })

  const formattedOfferSize = formatDecimal(offerSize / 1e9)

  return (
    <div className={styles.additionalSummary}>
      <StatInfo
        label="Funding at least"
        value={`${loansQuantity} loans`}
        tooltipText="The minimum amount of loans you will fund if the entire liquidity in offer is lent at the Max Offer value. As borrowers can borrow at loan values equal to or less than your Max Offer, you may end up funding more loans"
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
    </div>
  )
}
