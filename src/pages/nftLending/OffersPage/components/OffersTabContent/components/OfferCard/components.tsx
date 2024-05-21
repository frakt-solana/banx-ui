import { FC } from 'react'

import classNames from 'classnames'

import { TensorLink } from '@banx/components/SolanaLinks'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { core } from '@banx/api/nft'
import { useMarketsPreview } from '@banx/pages/nftLending/LendPage'
import { HealthColorIncreasing, calculateApr, getColorByPercent } from '@banx/utils'

import styles from './OfferCard.module.less'

interface MainOfferOverviewProps {
  offer: core.UserOffer
}

export const MainOfferOverview: FC<MainOfferOverviewProps> = ({ offer }) => {
  const { collectionName, collectionImage, collectionFloor } = offer.collectionMeta

  const { marketsPreview } = useMarketsPreview()
  const { bestOffer = 0, tensorSlug } =
    marketsPreview.find((market) => market.marketPubkey === offer.offer.hadoMarket) || {}

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
            value={<DisplayValue value={collectionFloor} />}
            tooltipText="Lowest listing price on marketplaces, excluding taker royalties and fees"
          />
          <StatInfo
            label="Top offer"
            value={<DisplayValue value={bestOffer} />}
            tooltipText="Highest offer among all lenders providing liquidity for this collection"
          />
        </div>
      </div>
    </div>
  )
}

interface AdditionalOfferOverviewProps {
  offer: core.UserOffer
  className?: string
}

export const AdditionalOfferOverview: FC<AdditionalOfferOverviewProps> = ({ offer, className }) => {
  const { fundsSolOrTokenBalance, bidSettlement, validation, buyOrdersQuantity, hadoMarket } =
    offer.offer

  const collectionFloor = offer.collectionMeta.collectionFloor
  const maxOfferValue = validation.loanToValueFilter
  const maxLtv = (maxOfferValue / collectionFloor) * 100

  const maxDynamicApr =
    calculateApr({ loanValue: maxOfferValue, collectionFloor, marketPubkey: hadoMarket }) / 100
  const initialOfferSize = fundsSolOrTokenBalance + bidSettlement

  return (
    <div className={classNames(styles.additionalOfferContainer, className)}>
      <StatInfo
        label="In offer"
        value={<DisplayValue value={initialOfferSize} />}
        tooltipText="Your total liquidity currently available in offer. Repayments from borrowers return here, close offer to stop"
        secondValue={`min ${buyOrdersQuantity} loans`}
      />
      <StatInfo
        label="Max offer"
        value={<DisplayValue value={maxOfferValue} />}
        secondValue={
          <span style={{ color: maxLtv ? getColorByPercent(maxLtv, HealthColorIncreasing) : '' }}>
            {createPercentValueJSX(maxLtv, '0%')} LTV
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
