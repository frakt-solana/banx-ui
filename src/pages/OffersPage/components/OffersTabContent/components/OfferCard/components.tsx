import { FC } from 'react'

import classNames from 'classnames'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { UserOffer } from '@banx/api/core'
import { calcSyntheticLoanValue } from '@banx/store'
import { HealthColorIncreasing, formatDecimal, getColorByPercent } from '@banx/utils'

import styles from './OfferCard.module.less'

interface MainOfferOverviewProps {
  offer: UserOffer
}

export const MainOfferOverview: FC<MainOfferOverviewProps> = ({ offer }) => {
  const { collectionName, collectionImage, collectionFloor } = offer.collectionMeta

  const {
    buyOrdersQuantity,
    bondingCurve: { delta },
  } = offer.offer

  const loanValue = calcSyntheticLoanValue(offer.offer)

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
  offer: UserOffer
  className?: string
}

export const AdditionalOfferOverview: FC<AdditionalOfferOverviewProps> = ({ offer, className }) => {
  const {
    edgeSettlement: lentValue,
    concentrationIndex: accruedInterest,
    fundsSolOrTokenBalance,
    bidSettlement,
    marketApr = 0,
    validation,
  } = offer.offer

  const loanValue = calcSyntheticLoanValue(offer.offer)

  const collectionFloor = offer.collectionMeta.collectionFloor
  const activeLoans = validation.maxReturnAmountFilter
  const offerSize = lentValue + fundsSolOrTokenBalance + bidSettlement

  const formattedOfferSize = formatDecimal(offerSize / 1e9)
  const formattedLentValue = formatDecimal(lentValue / 1e9)
  const formattedAprValue = (marketApr / 100)?.toFixed(0)
  const formattedLtvValue = collectionFloor / loanValue / 100

  return (
    <div className={classNames(styles.additionalOfferContainer, className)}>
      <StatInfo
        label="Lent"
        value={`${formattedLentValue}/${formattedOfferSize}◎`}
        valueType={VALUES_TYPES.STRING}
        secondValue={`${activeLoans} loans`}
      />
      <StatInfo
        label="LTV"
        value={formattedLtvValue}
        valueType={VALUES_TYPES.PERCENT}
        valueStyles={{ color: getColorByPercent(formattedLtvValue, HealthColorIncreasing) }}
      />
      <StatInfo
        label="Accrued interest"
        value={accruedInterest}
        secondValue={`${formattedAprValue}% APR`}
        divider={1e9}
      />
    </div>
  )
}
