import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { core } from '@banx/api/tokens'
import { ChevronDown } from '@banx/icons'

import ExpandedCardContent from '../ExpandedCardContent'

import styles from './OfferTokenCard.module.less'

interface OfferTokenCardProps {
  offerPreview: core.TokenOfferPreview
  onClick: () => void
  isOpen: boolean
}

const OfferTokenCard: FC<OfferTokenCardProps> = ({ offerPreview, onClick, isOpen }) => {
  return (
    <div className={styles.card}>
      <div className={classNames(styles.cardBody, { [styles.opened]: isOpen })} onClick={onClick}>
        <MarketMainInfo offerPreview={offerPreview} />
        <div className={styles.additionalContentWrapper}>
          <MarketAdditionalInfo offerPreview={offerPreview} isOpen={isOpen} />
          <Button
            type="circle"
            className={classNames(styles.chevronButton, { [styles.opened]: isOpen })}
          >
            <ChevronDown />
          </Button>
        </div>
      </div>
      {isOpen && (
        <ExpandedCardContent
          marketPubkey={offerPreview.tokenMarketPreview.marketPubkey}
          offerPubkey={offerPreview.publicKey}
        />
      )}
    </div>
  )
}

export default OfferTokenCard

const MarketMainInfo: FC<{ offerPreview: core.TokenOfferPreview }> = ({ offerPreview }) => {
  const { collateralTokenImageUrl, collateralTokenTicker, collateralTokenPrice, bestOffer } =
    offerPreview.tokenMarketPreview

  return (
    <div className={styles.mainInfoContainer}>
      <img src={collateralTokenImageUrl} className={styles.collateralImage} />
      <div className={styles.mainInfoContent}>
        <h4 className={styles.collateralName}>{collateralTokenTicker}</h4>
        <div className={styles.mainInfoStats}>
          <StatInfo label="Market" value={collateralTokenPrice} tooltipText="" />
          <StatInfo label="Top offer" value={<DisplayValue value={bestOffer} />} tooltipText="" />
        </div>
      </div>
    </div>
  )
}

interface MarketAdditionalInfoProps {
  offerPreview: core.TokenOfferPreview
  isOpen: boolean
}

const MarketAdditionalInfo: FC<MarketAdditionalInfoProps> = ({ offerPreview, isOpen }) => {
  const { inLoans, offerSize } = offerPreview.tokenOfferPreview
  const { marketApr, marketApy } = offerPreview.tokenMarketPreview

  return (
    <div className={classNames(styles.additionalInfoStats, { [styles.opened]: isOpen })}>
      <StatInfo
        label="In loans"
        value={<DisplayValue value={inLoans} />}
        tooltipText="Liquidity that is locked in active loans"
        classNamesProps={{ container: styles.additionalStat }}
      />
      <StatInfo
        label="In offers"
        value={<DisplayValue value={offerSize} />}
        tooltipText="Liquidity that is locked in active offers"
        classNamesProps={{ container: styles.additionalStat }}
      />
      <StatInfo
        label="APR / APY"
        value={
          <>
            {createPercentValueJSX(marketApr, '0%')} / {createPercentValueJSX(marketApy, '0%')}
          </>
        }
        tooltipText="APR / APY"
        valueType={VALUES_TYPES.STRING}
        classNamesProps={{ container: styles.additionalStat, value: styles.additionalAprStat }}
      />
    </div>
  )
}
