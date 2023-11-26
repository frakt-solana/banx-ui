import { FC } from 'react'

import classNames from 'classnames'
import { PairState } from 'fbonds-core/lib/fbond-protocol/types'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { createPercentValueJSX, createSolValueJSX } from '@banx/components/TableComponents'

import { CollectionMeta, Loan, Offer } from '@banx/api/core'
import { CloseModal, Pencil } from '@banx/icons'
import { formatDecimal, trackPageEvent } from '@banx/utils'

import { getAdditionalOfferInfo } from './helpers'
import { useActionsCell } from './hooks'

import styles from './OfferCard.module.less'

interface MainOfferOverviewProps {
  offer: Offer
  collectionMeta: CollectionMeta
}

export const MainOfferOverview: FC<MainOfferOverviewProps> = ({ offer, collectionMeta }) => {
  const { collectionName, collectionImage, collectionFloor } = collectionMeta

  const {
    currentSpotPrice,
    fundsSolOrTokenBalance,
    pairState,
    bondingCurve: { delta },
  } = offer

  const displayDeltaValue = delta ? `| Δ${formatDecimal(delta / 1e9)}◎` : ''
  const displayOfferValue = formatDecimal(currentSpotPrice / 1e9)

  const disabledActionButton = pairState === PairState.PerpetualBondingCurveClosed

  const { removeOffer, goToEditOffer } = useActionsCell(offer, collectionMeta)

  const onEdit = () => {
    goToEditOffer()
    trackPageEvent('myoffers', 'pendingtab-edit')
  }

  const onRemove = () => {
    removeOffer()
    trackPageEvent('myoffers', 'pendingtab-remove')
  }

  return (
    <div className={styles.mainOfferContainer}>
      <img src={collectionImage} className={styles.collectionImage} />
      <div className={styles.mainOfferInfo}>
        <h4 className={styles.collectionName}>{collectionName}</h4>
        <div className={styles.mainOfferStats}>
          <StatInfo label="Floor" value={collectionFloor} divider={1e9} />
          <StatInfo
            label="Offer"
            value={`${displayOfferValue} ${displayDeltaValue}`}
            valueType={VALUES_TYPES.STRING}
          />
          <StatInfo label="Size" value={fundsSolOrTokenBalance} divider={1e9} />
        </div>
      </div>
      <div className={styles.actionsOfferButtons}>
        <Button
          onClick={onEdit}
          className={classNames(styles.editOfferButton, {
            [styles.disabled]: disabledActionButton,
          })}
          type="circle"
          variant="secondary"
          size="medium"
          disabled={disabledActionButton}
        >
          <Pencil />
        </Button>
        <Button
          onClick={onRemove}
          className={classNames(styles.removeOfferButton, {
            [styles.disabled]: disabledActionButton,
          })}
          type="circle"
          variant="secondary"
          size="medium"
          disabled={disabledActionButton}
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
  const { lent, repaid, claim, apy, interest, totalLoans } = getAdditionalOfferInfo(loans)

  return (
    <div className={styles.additionalOfferContainer}>
      <div className={styles.additionalStat}>
        <div className={styles.additionalStatLabel}>Lend</div>
        <div className={styles.additionalStatValues}>
          {createSolValueJSX(lent, 1e9, '0◎')}
          <span>
            {totalLoans}/{totalLoans} loans
          </span>
        </div>
      </div>
      <div className={styles.additionalStat}>
        <div className={styles.additionalStatLabel}>Repaid</div>
        <div className={styles.additionalStatValues}>{createSolValueJSX(repaid, 1e9, '0◎')}</div>
      </div>
      <div className={styles.additionalStat}>
        <div className={styles.additionalStatLabel}>Claim</div>
        <div className={styles.additionalStatValues}>
          {createSolValueJSX(claim, 1e9, '0◎')}
          <span className={styles.ltvValue}>{createPercentValueJSX(apy, '0%')} LTV</span>
        </div>
      </div>
      <div className={styles.additionalStat}>
        <div className={styles.additionalStatLabel}>Interest</div>
        <div className={classNames(styles.additionalStatValues, styles.interestValues)}>
          {createSolValueJSX(interest, 1e9, '0◎')}
          <span>{createPercentValueJSX(apy, '0%')} APY</span>
        </div>
      </div>
    </div>
  )
}
