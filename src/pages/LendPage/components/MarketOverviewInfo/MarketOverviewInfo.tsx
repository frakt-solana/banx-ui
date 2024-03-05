import { FC } from 'react'

import { Tooltip } from 'antd'
import classNames from 'classnames'

import { MAX_APR_VALUE } from '@banx/components/PlaceOfferSection'
import { TensorLink } from '@banx/components/SolanaLinks'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { MarketPreview } from '@banx/api/core'
import { MARKETS_WITH_CUSTOM_APR } from '@banx/constants'
import { Fire } from '@banx/icons'
import { formatDecimal } from '@banx/utils'

import styles from './MarketOverviewInfo.module.less'

export const MarketMainInfo: FC<{ market: MarketPreview }> = ({ market }) => {
  const { collectionName, isHot, collectionFloor, bestOffer, tensorSlug } = market

  const formattedMaxOffer = formatDecimal(bestOffer / 1e9)

  return (
    <div className={styles.mainInfoContainer}>
      <img src={market.collectionImage} className={styles.collectionImage} />
      <div className={styles.mainInfoContent}>
        <div className={styles.collectionInfo}>
          <h4 className={styles.collectionName}>{collectionName}</h4>
          {isHot && (
            <Tooltip title="Collection is in huge demand waiting for lenders!">
              <Fire />
            </Tooltip>
          )}
          {tensorSlug && <TensorLink className={styles.tensorLink} slug={tensorSlug} />}
        </div>

        <div className={styles.mainInfoStats}>
          <StatInfo
            label="Floor"
            tooltipText="Lowest listing price on marketplaces, excluding taker royalties and fees"
            value={collectionFloor}
            divider={1e9}
          />
          <StatInfo
            label="Top offer"
            value={`${formattedMaxOffer}◎`}
            tooltipText="Highest offer among all lenders providing liquidity for this collection"
            valueType={VALUES_TYPES.STRING}
          />
        </div>
      </div>
    </div>
  )
}

interface MarketAdditionalInfoProps {
  market: MarketPreview
  isCardOpen: boolean
}

export const MarketAdditionalInfo: FC<MarketAdditionalInfoProps> = ({ market, isCardOpen }) => {
  const { loansTvl, offerTvl, activeBondsAmount, marketPubkey } = market

  const customApr = MARKETS_WITH_CUSTOM_APR[marketPubkey]
  const apr = customApr !== undefined ? customApr / 100 : MAX_APR_VALUE

  return (
    <div className={classNames(styles.additionalInfoStats, { [styles.hidden]: isCardOpen })}>
      <StatInfo
        label="In loans"
        value={loansTvl}
        secondValue={`in ${activeBondsAmount} loans`}
        tooltipText="Liquidity that is locked in active loans"
        divider={1e9}
      />
      <StatInfo
        label="In offers"
        value={offerTvl}
        tooltipText="Total liquidity currently available in pending offers"
        divider={1e9}
      />
      <StatInfo
        label="Max apr"
        value={apr}
        classNamesProps={{ value: styles.aprValue }}
        tooltipText="Maximum annual interest rate. Ranges between 34-104% APR depending on the loan-to-value (LTV) offered, and becomes fixed once offer is taken"
        valueType={VALUES_TYPES.PERCENT}
      />
    </div>
  )
}
