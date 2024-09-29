import { FC } from 'react'

import { Tooltip } from 'antd'
import classNames from 'classnames'

import { MAX_APR_VALUE } from '@banx/components/PlaceOfferSection'
import { TensorLink } from '@banx/components/SolanaLinks'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { core } from '@banx/api/nft'
import { NFT_MARKETS_WITH_CUSTOM_APR } from '@banx/constants'
import { Fire } from '@banx/icons'

import styles from './MarketOverviewInfo.module.less'

export const MarketMainInfo: FC<{ market: core.MarketPreview }> = ({ market }) => {
  const { collectionName, isHot, tensorSlug } = market

  return (
    <div className={styles.mainInfoContainer}>
      <img src={market.collectionImage} className={styles.collectionImage} />
      <h4 className={styles.collectionName}>{collectionName}</h4>
      {tensorSlug && <TensorLink className={styles.tensorLink} slug={tensorSlug} />}
      {isHot && (
        <Tooltip title="Collection is in huge demand waiting for lenders!">
          <Fire />
        </Tooltip>
      )}
    </div>
  )
}

interface MarketAdditionalInfoProps {
  market: core.MarketPreview
  isCardOpen: boolean
}

export const MarketAdditionalInfo: FC<MarketAdditionalInfoProps> = ({ market, isCardOpen }) => {
  const {
    activeBondsAmount,
    activeOfferAmount,
    bestOffer,
    collectionFloor,
    loansTvl,
    marketPubkey,
    offerTvl,
  } = market

  const customApr = NFT_MARKETS_WITH_CUSTOM_APR[marketPubkey]
  const apr = customApr !== undefined ? customApr / 100 : MAX_APR_VALUE

  const classNamesProps = {
    container: styles.additionalInfoStat,
    labelWrapper: styles.additionalInfoStatLabelWrapper,
  }

  return (
    <div className={classNames(styles.additionalInfoStats, { [styles.opened]: isCardOpen })}>
      <StatInfo
        label="Floor"
        value={<DisplayValue value={collectionFloor} />}
        tooltipText="Lowest listing price on marketplaces, excluding taker royalties and fees"
        classNamesProps={classNamesProps}
      />
      <StatInfo
        label="Top offer"
        value={<DisplayValue value={bestOffer} />}
        tooltipText="Highest offer among all lenders providing liquidity for this collection"
        classNamesProps={classNamesProps}
      />

      <StatInfo
        label="In loans"
        value={<DisplayValue value={loansTvl} />}
        secondValue={`in ${activeBondsAmount} loans`}
        tooltipText="Liquidity that is locked in active loans"
        classNamesProps={classNamesProps}
      />
      <StatInfo
        label="In offers"
        value={<DisplayValue value={offerTvl} />}
        secondValue={`in ${activeOfferAmount} offers`}
        tooltipText="Total liquidity currently available in pending offers"
        classNamesProps={classNamesProps}
      />
      <StatInfo
        label="Max apr"
        value={apr}
        tooltipText="Maximum annual interest rate. Ranges between 34-104% APR depending on the loan-to-value (LTV) offered, and becomes fixed once offer is taken"
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={{ ...classNamesProps, value: styles.additionalAprStat }}
      />
    </div>
  )
}
