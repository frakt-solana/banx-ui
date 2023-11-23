import { FC } from 'react'

import classNames from 'classnames'
import { PairState } from 'fbonds-core/lib/fbond-protocol/types'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { CollectionMeta, Loan, Offer } from '@banx/api/core'
import { CloseModal, Pencil } from '@banx/icons'
import { formatDecimal } from '@banx/utils'

import { getAdditionalOfferInfo } from './helpers'

import styles from './OfferCard.module.less'

interface MainOfferOverviewProps {
  offer: Offer
  collectionMeta: CollectionMeta
}

export const MainOfferOverview: FC<MainOfferOverviewProps> = ({ offer, collectionMeta }) => {
  const { collectionName, collectionImage } = collectionMeta

  const {
    currentSpotPrice,
    fundsSolOrTokenBalance,
    buyOrdersQuantity,
    pairState,
    bondingCurve: { delta },
  } = offer

  const displayDeltaValue = delta ? `| Δ${formatDecimal(delta / 1e9)}◎` : ''
  const displayOfferValue = formatDecimal(currentSpotPrice / 1e9)

  const disabled = pairState !== PairState.PerpetualBondingCurveClosed

  return (
    <div className={styles.mainOfferContainer}>
      <img src={collectionImage} className={styles.collectionImage} />
      <div className={styles.mainOfferInfo}>
        <h4 className={styles.collectionName}>{collectionName}</h4>
        <div className={styles.mainOfferStats}>
          <StatInfo
            label="Offer"
            value={`${displayDeltaValue}${displayOfferValue}`}
            valueType={VALUES_TYPES.STRING}
          />
          <StatInfo
            label="Loans"
            value={`${buyOrdersQuantity} / ${buyOrdersQuantity}`}
            valueType={VALUES_TYPES.STRING}
          />
          <StatInfo label="Size" value={fundsSolOrTokenBalance} divider={1e9} />
        </div>
      </div>
      <div className={styles.actionsOfferButtons}>
        <Button
          className={classNames(styles.editOfferButton, { [styles.disabled]: disabled })}
          type="circle"
          variant="secondary"
          size="medium"
          disabled={disabled}
        >
          <Pencil />
        </Button>
        <Button
          className={classNames(styles.removeOfferButton, { [styles.disabled]: disabled })}
          type="circle"
          variant="secondary"
          size="medium"
          disabled={disabled}
        >
          <CloseModal />
        </Button>
      </div>
    </div>
  )
}

interface AdditionalOfferOverviewProps {
  loans: Loan[]
}

export const AdditionalOfferOverview: FC<AdditionalOfferOverviewProps> = ({ loans }) => {
  const { lent, repaid, claim, apy, interest } = getAdditionalOfferInfo(loans)

  return (
    <div className={styles.additionalOfferContainer}>
      <StatInfo label="Lent" value={lent} divider={1e9} />
      <StatInfo label="Repaid" value={repaid} divider={1e9} />
      <StatInfo label="Claim" value={claim} />
      <StatInfo
        label="APY"
        value={apy}
        classNamesProps={{ value: styles.additionalApyStat }}
        valueType={VALUES_TYPES.PERCENT}
      />
      <StatInfo
        label="Interest"
        value={interest}
        classNamesProps={{ value: styles.additionalInterestStat }}
      />
    </div>
  )
}
