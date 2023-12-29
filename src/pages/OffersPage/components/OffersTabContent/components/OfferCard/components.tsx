import { FC } from 'react'

import classNames from 'classnames'

import { MIN_APR_VALUE } from '@banx/components/PlaceOfferSection'
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
  const { fundsSolOrTokenBalance, bidSettlement, validation } = offer.offer

  const collectionFloor = offer.collectionMeta.collectionFloor
  const availableToFund = fundsSolOrTokenBalance + bidSettlement

  const bestCurrentOfferValue = calcSyntheticLoanValue(offer.offer)

  const bestOfferValue = validation.loanToValueFilter
  const maxLtv = (bestOfferValue / collectionFloor) * 100

  const maxDynamicApr = calcDynamicApr(bestCurrentOfferValue, collectionFloor)

  return (
    <div className={classNames(styles.additionalOfferContainer, className)}>
      <StatInfo
        label="Available"
        value={`${formatDecimal(availableToFund / 1e9)}◎`}
        tooltipText="Current pool liquidity"
        valueType={VALUES_TYPES.STRING}
        classNamesProps={{ value: styles.value }}
      />
      <StatInfo
        label="Max offer"
        value={`${formatDecimal(bestOfferValue / 1e9)}◎`}
        valueType={VALUES_TYPES.STRING}
        secondValue={
          <span style={{ color: maxLtv ? getColorByPercent(maxLtv, HealthColorIncreasing) : '' }}>
            {createPercentValueJSX(maxLtv, '0%')} LTV
          </span>
        }
        tooltipText="Max offer given sufficient pool liquidity"
      />
      <StatInfo
        label="Apr"
        value={`${MIN_APR_VALUE} - ${maxDynamicApr?.toFixed(0)}%`}
        classNamesProps={{ value: styles.value }}
        valueType={VALUES_TYPES.STRING}
      />
    </div>
  )
}
