import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import PlaceOfferSection from '@banx/components/PlaceOfferSection'
import { TensorLink } from '@banx/components/SolanaLinks'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { core } from '@banx/api/nft'
import { ChevronDown } from '@banx/icons'
import { convertToSynthetic, useSyntheticOffers } from '@banx/store/nft'
import { HealthColorIncreasing, calculateApr, getColorByPercent } from '@banx/utils'

import { TOOLTIP_TEXTS } from '../../constants'

import styles from './OfferCard.module.less'

interface OfferCardProps {
  offer: core.Offer
  market: core.MarketPreview | undefined

  onToggleCard: () => void
  isOpen: boolean
}

const OfferCard: FC<OfferCardProps> = ({ offer, market, onToggleCard, isOpen }) => {
  const { setOffer: setSyntheticOffer } = useSyntheticOffers()

  const handleCardClick = () => {
    onToggleCard()
    setSyntheticOffer(convertToSynthetic(offer, true))
  }

  return (
    <div className={styles.card}>
      <div
        onClick={handleCardClick}
        className={classNames(styles.cardBody, { [styles.opened]: isOpen })}
      >
        <MainOfferOverview market={market} />
        <div className={styles.additionalContentWrapper}>
          <AdditionalOfferOverview offer={offer} market={market} isOpen={isOpen} />
          <Button
            type="circle"
            size="medium"
            className={classNames(styles.chevronButton, { [styles.opened]: isOpen })}
          >
            <ChevronDown />
          </Button>
        </div>
      </div>
      {isOpen && (
        <div className={styles.placeOfferContent}>
          <PlaceOfferSection offerPubkey={offer.publicKey} marketPubkey={offer.hadoMarket} />
        </div>
      )}
    </div>
  )
}

export default OfferCard

const MainOfferOverview: FC<{ market: core.MarketPreview | undefined }> = ({ market }) => {
  const { collectionName, collectionImage, tensorSlug = '' } = market || {}

  return (
    <div className={styles.mainInfoContainer}>
      <img src={collectionImage} className={styles.collectionImage} />
      <h4 className={styles.collectionName}>{collectionName}</h4>
      {tensorSlug && <TensorLink className={styles.tensorLink} slug={tensorSlug} />}
    </div>
  )
}

interface AdditionalOfferOverviewProps {
  offer: core.Offer
  market: core.MarketPreview | undefined
  isOpen: boolean
}

const AdditionalOfferOverview: FC<AdditionalOfferOverviewProps> = ({ offer, market, isOpen }) => {
  const { fundsSolOrTokenBalance, bidSettlement, validation, buyOrdersQuantity, hadoMarket } = offer
  const { collectionFloor = 0, bestOffer = 0 } = market || {}

  const loanValue = validation.loanToValueFilter
  const offerSize = fundsSolOrTokenBalance + bidSettlement

  const maxLtv = (loanValue / collectionFloor) * 100
  const maxApr = calculateApr({ loanValue, collectionFloor, marketPubkey: hadoMarket }) / 100

  const classNamesProps = {
    container: styles.additionalInfoStat,
    labelWrapper: styles.additionalInfoStatLabelWrapper,
  }

  return (
    <div className={classNames(styles.additionalInfoStats, { [styles.opened]: isOpen })}>
      <StatInfo
        label="Floor"
        value={<DisplayValue value={collectionFloor} />}
        tooltipText={TOOLTIP_TEXTS.FLOOR}
        classNamesProps={classNamesProps}
      />

      <StatInfo
        label="Top offer"
        value={<DisplayValue value={bestOffer} />}
        tooltipText={TOOLTIP_TEXTS.TOP_OFFER}
        classNamesProps={classNamesProps}
      />

      <StatInfo
        label="In offer"
        value={<DisplayValue value={offerSize} />}
        secondValue={`min ${buyOrdersQuantity} loans`}
        tooltipText={TOOLTIP_TEXTS.IN_OFFER}
        classNamesProps={classNamesProps}
      />

      <StatInfo
        label="Max offer"
        value={<DisplayValue value={loanValue} />}
        secondValue={
          <span style={{ color: maxLtv ? getColorByPercent(maxLtv, HealthColorIncreasing) : '' }}>
            {createPercentValueJSX(maxLtv, '0%')} LTV
          </span>
        }
        tooltipText={TOOLTIP_TEXTS.MAX_OFFER}
        classNamesProps={classNamesProps}
      />

      <StatInfo
        label="Max Apr"
        value={maxApr}
        valueType={VALUES_TYPES.PERCENT}
        tooltipText={TOOLTIP_TEXTS.MAX_APR}
        classNamesProps={classNamesProps}
      />
    </div>
  )
}
