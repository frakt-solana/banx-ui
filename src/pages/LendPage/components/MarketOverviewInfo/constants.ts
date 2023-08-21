import { VALUES_TYPES } from '@banx/components/StatInfo'

import { MarketPreview } from '@banx/api/core'
import { ColorByPercentOffers, convertAprToApy, getColorByPercent } from '@banx/utils'

export const ADDITIONAL_MARKET_INFO = [
  {
    key: 'offerTVL',
    label: 'In offers',
    tooltipText: 'Total liquidity currently available in active offers',
    secondValue: (market: MarketPreview) => `in ${market?.activeOfferAmount || 0} offers`,
    divider: 1e9,
  },
  {
    key: 'loansTVL',
    label: 'Taken',
    tooltipText: 'Liquidity that is locked in active loans',
    secondValue: (market: MarketPreview) => `in ${market?.activeBondsAmount || 0} loans`,
    divider: 1e9,
  },
  {
    key: 'marketAPR',
    label: 'Apy',
    tooltipText: 'Interest (in %) for the duration of this loan',
    valueRenderer: (apr: number) => convertAprToApy(apr / 1e4),
    valueType: VALUES_TYPES.PERCENT,
    valueStyles: (market: MarketPreview) => ({
      color: getColorByPercent(market.marketAPR / 1e4, ColorByPercentOffers),
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
