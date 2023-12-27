import { FC } from 'react'

import { Tooltip } from 'antd'
import classNames from 'classnames'

import { MAX_APR_VALUE, MIN_APR_VALUE } from '@banx/components/PlaceOfferSection'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { MarketPreview } from '@banx/api/core'
import { Fire } from '@banx/icons'

import styles from './MarketOverviewInfo.module.less'

export const MarketMainInfo: FC<{ market: MarketPreview }> = ({ market }) => {
  const { collectionName, isHot, collectionFloor, bestOffer, bestLtv } = market

  return (
    <div className={styles.mainInfoContainer}>
      <img src={market.collectionImage} className={styles.collectionImage} />
      <div className={styles.mainInfoContent}>
        <h4 className={styles.collectionName}>
          {collectionName}
          {isHot ? (
            <Tooltip title="Collection is in huge demand waiting for lenders!">
              <Fire />
            </Tooltip>
          ) : null}
        </h4>
        <div className={styles.mainInfoStats}>
          <StatInfo label="Floor" value={collectionFloor} divider={1e9} />
          <StatInfo
            label="Best"
            value={bestOffer}
            tooltipText="Highest current offer"
            divider={1e9}
          />
          <StatInfo
            label="Ltv"
            value={bestLtv}
            tooltipText="Best offer expressed as a % of floor price"
            valueType={VALUES_TYPES.PERCENT}
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
  const { loansTvl, offerTvl, activeBondsAmount, activeOfferAmount } = market

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
        secondValue={`in ${activeOfferAmount} offers`}
        tooltipText="Total liquidity currently available in active offers"
        divider={1e9}
      />
      <StatInfo
        label="Apr"
        value={`${MIN_APR_VALUE} - ${MAX_APR_VALUE}%`}
        classNamesProps={{ value: styles.aprValue }}
        tooltipText="Annual interest rate"
        valueType={VALUES_TYPES.STRING}
      />
    </div>
  )
}
