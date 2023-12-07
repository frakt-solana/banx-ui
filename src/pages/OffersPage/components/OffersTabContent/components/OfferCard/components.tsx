import React, { FC } from 'react'

import classNames from 'classnames'
import { PairState } from 'fbonds-core/lib/fbond-protocol/types'

import { Button, ButtonProps } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { createPercentValueJSX, createSolValueJSX } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'

import { CollectionMeta, Loan, Offer } from '@banx/api/core'
import { CloseModal, Pencil } from '@banx/icons'
import { calcSyntheticLoanValue } from '@banx/store'
import {
  HealthColorIncreasing,
  formatDecimal,
  getColorByPercent,
  trackPageEvent,
} from '@banx/utils'

import { getAdditionalOfferInfo } from './helpers'
import { useOfferActions } from './hooks'

import styles from './OfferCard.module.less'

interface MainOfferOverviewProps {
  offer: Offer
  collectionMeta: CollectionMeta
}

export const MainOfferOverview: FC<MainOfferOverviewProps> = ({ offer, collectionMeta }) => {
  const { collectionName, collectionImage, collectionFloor } = collectionMeta

  const {
    fundsSolOrTokenBalance,
    pairState,
    bidSettlement,
    buyOrdersQuantity,
    bondingCurve: { delta },
  } = offer

  const offerSize = Math.max(fundsSolOrTokenBalance + bidSettlement, 0)

  const loanValue = calcSyntheticLoanValue(offer)

  const minDeltaValue = loanValue - (buyOrdersQuantity - 1) * delta

  const formattedLoanValue = formatDecimal(loanValue / 1e9)
  const formattedMinLoanValue = formatDecimal(minDeltaValue / 1e9)

  const displayOfferValue = delta
    ? `${formattedLoanValue} - ${formattedMinLoanValue}`
    : `${formattedLoanValue}`

  const { removeOffer, goToEditOffer } = useOfferActions(offer, collectionMeta)

  const onEdit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    goToEditOffer()
    trackPageEvent('myoffers', 'pendingtab-edit')
    event.stopPropagation()
  }

  const onRemove = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    removeOffer()
    trackPageEvent('myoffers', 'pendingtab-remove')
    event.stopPropagation()
  }

  const disabledActionButton = pairState === PairState.PerpetualBondingCurveClosed
  const actionButtonProps: ButtonProps = {
    type: 'circle',
    variant: 'secondary',
    size: 'medium',
    disabled: disabledActionButton,
    className: classNames(styles.actionButton, {
      [styles.disabled]: disabledActionButton,
    }),
  }

  return (
    <div className={styles.mainOfferContainer}>
      <img src={collectionImage} className={styles.collectionImage} />
      <div className={styles.mainOfferInfo}>
        <h4 className={styles.collectionName}>{collectionName}</h4>
        <div className={styles.mainOfferStats}>
          <StatInfo label="Floor" value={collectionFloor} divider={1e9} />
          <StatInfo label="Offer" value={`${displayOfferValue}◎`} valueType={VALUES_TYPES.STRING} />
          <StatInfo label="Size" value={offerSize} divider={1e9} />
        </div>
      </div>
      <div className={styles.actionsOfferButtons}>
        <Tooltip title="Edit">
          <>
            <Button {...actionButtonProps} onClick={onEdit}>
              <Pencil />
            </Button>
          </>
        </Tooltip>

        <Tooltip title="Close">
          <>
            <Button
              {...actionButtonProps}
              className={classNames(styles.removeOfferButton, actionButtonProps.className)}
              onClick={onRemove}
            >
              <CloseModal />
            </Button>
          </>
        </Tooltip>
      </div>
    </div>
  )
}

interface AdditionalOfferOverviewProps {
  loans: Loan[]
  offer: Offer
  className?: string
}

export const AdditionalOfferOverview: FC<AdditionalOfferOverviewProps> = ({
  loans,
  offer,
  className,
}) => {
  const { lent, repaid, claim, apr, ltv, interest, totalLoansQuantity, activeLoansQuantity } =
    getAdditionalOfferInfo({ loans, offer })

  const colorLtv = getColorByPercent(ltv, HealthColorIncreasing)

  return (
    <div className={classNames(styles.additionalOfferContainer, className)}>
      <div className={styles.additionalStat}>
        <div className={styles.additionalStatLabel}>Lent</div>
        <div className={styles.additionalStatValues}>
          {createSolValueJSX(lent, 1e9, '0◎', formatDecimal)}
          <span className={styles.additionalStatSubtitle}>
            {activeLoansQuantity}/{totalLoansQuantity} loans
          </span>
        </div>
      </div>
      <div className={styles.additionalStat}>
        <div className={styles.additionalStatLabel}>Repaid</div>
        <div className={styles.additionalStatValues}>
          {createSolValueJSX(repaid, 1e9, '0◎', formatDecimal)}
        </div>
      </div>
      <div className={styles.additionalStat}>
        <div className={styles.additionalStatLabel}>Claim</div>
        <div className={styles.additionalStatValues}>
          {createSolValueJSX(claim, 1e9, '0◎')}
          <span style={{ color: ltv ? colorLtv : '' }} className={styles.additionalStatSubtitle}>
            {createPercentValueJSX(ltv, '0%')} LTV
          </span>
        </div>
      </div>
      <div className={styles.additionalStat}>
        <div className={styles.additionalStatLabel}>Interest</div>
        <div
          className={classNames(styles.additionalStatValues, styles.interestValues, {
            [styles.highlight]: interest,
          })}
        >
          {createSolValueJSX(interest, 1e9, '0◎', formatDecimal)}
          <span className={classNames({ [styles.highlight]: apr })}>
            {createPercentValueJSX(apr, '0%')} APR
          </span>
        </div>
      </div>
    </div>
  )
}
