import { FC } from 'react'

import classNames from 'classnames'
import { BN } from 'fbonds-core'

import { TensorLink } from '@banx/components/SolanaLinks'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { coreNew } from '@banx/api/nft'
import { useMarketsPreview } from '@banx/pages/nftLending/LendPage'
import { HealthColorIncreasing, ZERO_BN, calculateApr, getColorByPercent } from '@banx/utils'

import styles from './OfferCard.module.less'

interface MainOfferOverviewProps {
  offer: coreNew.UserOffer
}

export const MainOfferOverview: FC<MainOfferOverviewProps> = ({ offer }) => {
  const { collectionName, collectionImage, collectionFloor } = offer.collectionMeta

  const { marketsPreview } = useMarketsPreview()
  const { bestOffer = ZERO_BN, tensorSlug } =
    marketsPreview.find(
      (market) => market.marketPubkey.toBase58() === offer.offer.hadoMarket.toBase58(),
    ) || {}

  return (
    <div className={styles.mainOfferContainer}>
      <img src={collectionImage} className={styles.collectionImage} />
      <div className={styles.mainOfferInfo}>
        <div className={styles.collectionInfo}>
          <h4 className={styles.collectionName}>{collectionName}</h4>
          {tensorSlug && <TensorLink className={styles.tensorLink} slug={tensorSlug} />}
        </div>
        <div className={styles.mainOfferStats}>
          <StatInfo
            label="Floor"
            value={<DisplayValue value={collectionFloor.toNumber()} />}
            tooltipText="Lowest listing price on marketplaces, excluding taker royalties and fees"
          />
          <StatInfo
            label="Top offer"
            value={<DisplayValue value={bestOffer.toNumber()} />}
            tooltipText="Highest offer among all lenders providing liquidity for this collection"
          />
        </div>
      </div>
    </div>
  )
}

interface AdditionalOfferOverviewProps {
  offer: coreNew.UserOffer
  className?: string
}

export const AdditionalOfferOverview: FC<AdditionalOfferOverviewProps> = ({ offer, className }) => {
  const { fundsSolOrTokenBalance, bidSettlement, validation, buyOrdersQuantity, hadoMarket } =
    offer.offer

  const collectionFloor = offer.collectionMeta.collectionFloor
  const maxOfferValue = validation.loanToValueFilter
  const maxLtv = maxOfferValue.mul(new BN(100)).div(collectionFloor)

  const maxDynamicApr =
    calculateApr({
      loanValue: maxOfferValue,
      collectionFloor,
      marketPubkey: hadoMarket,
    }).toNumber() / 100
  const initialOfferSize = fundsSolOrTokenBalance.add(bidSettlement)

  return (
    <div className={classNames(styles.additionalOfferContainer, className)}>
      <StatInfo
        label="In offer"
        value={<DisplayValue value={initialOfferSize.toNumber()} />}
        tooltipText="Your total liquidity currently available in offer. Repayments from borrowers return here, close offer to stop"
        secondValue={`min ${buyOrdersQuantity} loans`}
      />
      <StatInfo
        label="Max offer"
        value={<DisplayValue value={maxOfferValue.toNumber()} />}
        secondValue={
          <span
            style={{
              color: maxLtv ? getColorByPercent(maxLtv.toNumber(), HealthColorIncreasing) : '',
            }}
          >
            {createPercentValueJSX(maxLtv.toNumber(), '0%')} LTV
          </span>
        }
        tooltipText="Your max offer given sufficient liquidity. Actual offer size taken can be less depending on the amount of SOL users choose to borrow"
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
