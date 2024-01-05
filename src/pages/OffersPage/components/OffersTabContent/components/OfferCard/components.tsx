import { FC } from 'react'

import classNames from 'classnames'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { createPercentValueJSX } from '@banx/components/TableComponents'

import { UserOffer } from '@banx/api/core'
import { calcSyntheticLoanValue } from '@banx/store'
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

  return (
    <div className={styles.mainOfferContainer}>
      <img src={collectionImage} className={styles.collectionImage} />
      <div className={styles.mainOfferInfo}>
        <h4 className={styles.collectionName}>{collectionName}</h4>
        <div className={styles.mainOfferStats}>
          <StatInfo label="Floor" value={collectionFloor} divider={1e9} />
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
  const { fundsSolOrTokenBalance, bidSettlement } = offer.offer

  const collectionFloor = offer.collectionMeta.collectionFloor
  const maxOfferValue = calcSyntheticLoanValue(offer.offer)
  const maxLtv = (maxOfferValue / collectionFloor) * 100

  const maxDynamicApr = calcDynamicApr(maxOfferValue, collectionFloor)
  const initialOfferSize = fundsSolOrTokenBalance + bidSettlement

  const formattedMaxOffer = formatDecimal(maxOfferValue / 1e9)

  return (
    <div className={classNames(styles.additionalOfferContainer, className)}>
      <StatInfo
        label="Max offer"
        value={`${formattedMaxOffer}◎`}
        valueType={VALUES_TYPES.STRING}
        secondValue={
          <span style={{ color: maxLtv ? getColorByPercent(maxLtv, HealthColorIncreasing) : '' }}>
            {createPercentValueJSX(maxLtv, '0%')} LTV
          </span>
        }
        tooltipText="Max offer given sufficient pool liquidity"
      />
      <StatInfo
        label="In offer"
        value={initialOfferSize}
        classNamesProps={{ value: styles.value }}
        valueType={VALUES_TYPES.SOLPRICE}
        divider={1e9}
      />
      <StatInfo
        label="Max Apr"
        value={maxDynamicApr}
        classNamesProps={{ value: styles.value }}
        valueType={VALUES_TYPES.PERCENT}
      />
    </div>
  )
}
