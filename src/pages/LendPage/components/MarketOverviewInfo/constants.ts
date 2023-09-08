import { VALUES_TYPES } from '@banx/components/StatInfo'

import { MarketPreview } from '@banx/api/core'
import { ColorByPercentHealth, convertAprToApy, getColorByPercent } from '@banx/utils'

export const ADDITIONAL_MARKET_INFO = [
  {
    key: 'loansTVL',
    label: 'In loans',
    tooltipText: 'Liquidity that is locked in active loans',
    secondValue: (market: MarketPreview) => `in ${market?.activeBondsAmount || 0} loans`,
    divider: 1e9,
  },
  {
    key: 'offerTVL',
    label: 'In offers',
    tooltipText: 'Total liquidity currently available in active offers',
    secondValue: (market: MarketPreview) => `in ${market?.activeOfferAmount || 0} offers`,
    divider: 1e9,
  },
  {
    key: 'marketAPR',
    label: 'Apr',
    tooltipText: 'Interest (in %) for the duration of this loan',
    valueRenderer: (apr: number) => apr / 1e2,
    valueType: VALUES_TYPES.PERCENT,
    valueStyles: (market: MarketPreview) => ({
      color: getColorByPercent(market.marketAPR / 100, ColorByPercentHealth),
      font: 'var(--important-text-md)',
    }),
  },
]

export const MAIN_MARKET_INFO = [
  { key: 'collectionFloor', label: 'Floor', divider: 1e9 },
  {
    key: 'bestOffer',
    label: 'Best',
    divider: 1e9,
    tooltipText: 'Current biggest offer for a loan',
  },
  {
    key: 'bestLTV',
    label: 'Ltv',
    divider: 1e9,
    valueType: VALUES_TYPES.PERCENT,
    tooltipText: 'Current biggest offer for a loan',
  },
]
