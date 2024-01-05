import { FC } from 'react'

import { Tooltip } from 'antd'
import classNames from 'classnames'

import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { createPercentValueJSX } from '@banx/components/TableComponents'

import { MarketPreview } from '@banx/api/core'
import { Fire } from '@banx/icons'
import {
  HealthColorIncreasing,
  calcDynamicApr,
  formatDecimal,
  getColorByPercent,
} from '@banx/utils'

import styles from './MarketOverviewInfo.module.less'

export const MarketMainInfo: FC<{ market: MarketPreview }> = ({ market }) => {
  const { collectionName, isHot, collectionFloor, bestOffer, bestLtv } = market

  const formattedMaxOffer = formatDecimal(bestOffer / 1e9)

  const maxOfferValueJSX = (
    <>
      <span>{formattedMaxOffer}◎</span>
      {' | '}
      <span style={{ color: bestLtv ? getColorByPercent(bestLtv, HealthColorIncreasing) : '' }}>
        {createPercentValueJSX(bestLtv, '0%')} LTV
      </span>
    </>
  )

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
            label="Top offer"
            value={maxOfferValueJSX}
            tooltipText="Highest current offer"
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
  const { loansTvl, offerTvl, bestOffer, collectionFloor, activeBondsAmount } = market

  const maxDynamicApr = calcDynamicApr(bestOffer, collectionFloor)

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
        tooltipText="Total liquidity currently available in active offers"
        divider={1e9}
        classNamesProps={{ value: styles.value }}
      />
      <StatInfo
        label="Max apr"
        value={maxDynamicApr}
        classNamesProps={{ value: styles.aprValue }}
        tooltipText="Annual interest rate"
        valueType={VALUES_TYPES.PERCENT}
      />
    </div>
  )
}
