import { VALUES_TYPES } from '@banx/components/StatInfo'

import { MarketPreview } from '@banx/api/core'

import styles from './MarketOverviewInfo.module.less'

export const ADDITIONAL_MARKET_INFO = [
  {
    key: 'loansTvl',
    label: 'In loans',
    tooltipText: 'Liquidity that is locked in active loans',
    secondValue: (market: MarketPreview) => `in ${market?.activeBondsAmount || 0} loans`,
    divider: 1e9,
  },
  {
    key: 'offerTvl',
    label: 'In offers',
    tooltipText: 'Total liquidity currently available in active offers',
    secondValue: (market: MarketPreview) => `in ${market?.activeOfferAmount || 0} offers`,
    divider: 1e9,
  },
  {
    key: 'marketApr',
    label: 'Apr',
    tooltipText: 'Annual interest rate',
    valueRenderer: (apr: number) => apr / 100,
    valueType: VALUES_TYPES.PERCENT,
    classNamesProps: { value: styles.aprValue },
  },
]

export const MAIN_MARKET_INFO = [
  { key: 'collectionFloor', label: 'Floor', divider: 1e9 },
  {
    key: 'bestOffer',
    label: 'Best',
    divider: 1e9,
    tooltipText: 'Highest current offer',
  },
  {
    key: 'bestLtv',
    label: 'Ltv',
    divider: 1e9,
    valueType: VALUES_TYPES.PERCENT,
    tooltipText: 'Best offer expressed as a % of floor price',
  },
]
