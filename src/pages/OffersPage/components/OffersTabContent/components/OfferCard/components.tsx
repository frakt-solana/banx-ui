import { FC } from 'react'

import classNames from 'classnames'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { createPercentValueJSX } from '@banx/components/TableComponents'

import { UserOffer } from '@banx/api/core'
import { useMarketsPreview } from '@banx/pages/LendPage'
import {
  HealthColorIncreasing,
  calcDynamicApr,
  formatDecimal,
  getColorByPercent,
} from '@banx/utils'

import styles from './OfferCard.module.less'

interface MainOfferOverviewProps {
  offer: UserOffer
}

export const MainOfferOverview: FC<MainOfferOverviewProps> = ({ offer }) => {
  const { collectionName, collectionImage, collectionFloor } = offer.collectionMeta

  const { marketsPreview } = useMarketsPreview()
  const { bestOffer = 0 } =
    marketsPreview.find((market) => market.marketPubkey === offer.offer.hadoMarket) || {}

  return (
    <div className={styles.mainOfferContainer}>
      <img src={collectionImage} className={styles.collectionImage} />
      <div className={styles.mainOfferInfo}>
        <h4 className={styles.collectionName}>{collectionName}</h4>
        <div className={styles.mainOfferStats}>
          <StatInfo label="Floor" value={collectionFloor} divider={1e9} />
          <StatInfo
            label="Top offer"
            value={bestOffer}
            divider={1e9}
            tooltipText="Highest offer among all lenders providing liquidity for this collection"
          />
        </div>
      </div>
    </div>
  )
}

interface AdditionalOfferOverviewProps {
  offer: UserOffer
  className?: string
}

export const AdditionalOfferOverview: FC<AdditionalOfferOverviewProps> = ({ offer, className }) => {
  const { fundsSolOrTokenBalance, bidSettlement, validation, buyOrdersQuantity } = offer.offer

  const collectionFloor = offer.collectionMeta.collectionFloor
  const maxOfferValue = validation.loanToValueFilter
  const maxLtv = (maxOfferValue / collectionFloor) * 100

  const maxDynamicApr = calcDynamicApr(maxOfferValue, collectionFloor)
  const initialOfferSize = fundsSolOrTokenBalance + bidSettlement

  const formattedMaxOffer = formatDecimal(maxOfferValue / 1e9)

  return (
    <div className={classNames(styles.additionalOfferContainer, className)}>
      <StatInfo
        label="In offer"
        value={initialOfferSize}
        valueType={VALUES_TYPES.SOLPRICE}
        tooltipText="Your total liquidity currently available in offer"
        secondValue={`min ${buyOrdersQuantity} loans`}
        divider={1e9}
      />
      <StatInfo
        label="Max offer"
        value={`${formattedMaxOffer}◎`}
        valueType={VALUES_TYPES.STRING}
        secondValue={
          <span style={{ color: maxLtv ? getColorByPercent(maxLtv, HealthColorIncreasing) : '' }}>
            {createPercentValueJSX(maxLtv, '0%')} LTV
          </span>
        }
        tooltipText="Your max offer given sufficient liquidity. Actual offer size taken can be less depending on the amount of SOL users choose to borrow."
      />
      <StatInfo
        label="Max Apr"
        value={maxDynamicApr}
        valueType={VALUES_TYPES.PERCENT}
        tooltipText="Your maximum annual interest rate. Ranges between 34-104% APR depending on the loan-to-value (LTV) offered, and becomes fixed once offer is taken"
      />
    </div>
  )
}
