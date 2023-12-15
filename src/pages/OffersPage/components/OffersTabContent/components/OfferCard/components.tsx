import { FC } from 'react'

import classNames from 'classnames'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { CollectionMeta, Loan, Offer } from '@banx/api/core'
import { calcSyntheticLoanValue } from '@banx/store'
import { formatDecimal } from '@banx/utils'

import styles from './OfferCard.module.less'

interface MainOfferOverviewProps {
  offer: Offer
  collectionMeta: CollectionMeta
}

export const MainOfferOverview: FC<MainOfferOverviewProps> = ({ offer, collectionMeta }) => {
  const { collectionName, collectionImage, collectionFloor } = collectionMeta

  const {
    buyOrdersQuantity,
    bondingCurve: { delta },
  } = offer

  const loanValue = calcSyntheticLoanValue(offer)

  const minDeltaValue = loanValue - (buyOrdersQuantity - 1) * delta

  const formattedLoanValue = formatDecimal(loanValue / 1e9)
  const formattedMinLoanValue = formatDecimal(minDeltaValue / 1e9)

  const displayOfferValue = delta
    ? `${formattedLoanValue} - ${formattedMinLoanValue}`
    : `${formattedLoanValue}`

  return (
    <div className={styles.mainOfferContainer}>
      <img src={collectionImage} className={styles.collectionImage} />
      <div className={styles.mainOfferInfo}>
        <h4 className={styles.collectionName}>{collectionName}</h4>
        <div className={styles.mainOfferStats}>
          <StatInfo label="Floor" value={collectionFloor} divider={1e9} />
          <StatInfo
            label="Best offer"
            value={`${displayOfferValue}◎`}
            valueType={VALUES_TYPES.STRING}
          />
        </div>
      </div>
    </div>
  )
}

interface AdditionalOfferOverviewProps {
  loans: Loan[]
  offer: Offer
  className?: string
}

export const AdditionalOfferOverview: FC<AdditionalOfferOverviewProps> = ({ className }) => {
  return <div className={classNames(styles.additionalOfferContainer, className)}></div>
}
