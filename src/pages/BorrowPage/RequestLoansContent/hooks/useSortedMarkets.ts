import { useMemo, useState } from 'react'

import { chain } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { MarketPreview } from '@banx/api/core'

type SortOrder = 'asc' | 'desc'

enum SortField {
  OFFER_TVL = 'offerTvl',
  LOANS_TVL = 'loansTvl',
  ACTIVE_LOANS = 'activeLoans',
}

const SORT_OPTIONS = [
  { label: 'Loans TVL', value: SortField.LOANS_TVL },
  { label: 'Offers TVL', value: SortField.OFFER_TVL },
  { label: 'Active loans', value: SortField.ACTIVE_LOANS },
]
const DEFAULT_SORT_OPTION = { label: 'Loans TVL', value: 'loansTvl_desc' }

type SortValueGetter = (market: MarketPreview) => number
type StatusValueMap = Record<SortField, SortValueGetter>

const STATUS_VALUE_MAP: StatusValueMap = {
  [SortField.OFFER_TVL]: (market) => market.offerTvl,
  [SortField.LOANS_TVL]: (market) => market.loansTvl,
  [SortField.ACTIVE_LOANS]: (market) => market.activeBondsAmount,
}

export const useSortedMarkets = (markets: MarketPreview[]) => {
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const sortOptionValue = sortOption?.value

  const sortedMarkets = useMemo(() => {
    if (!sortOptionValue) return markets

    const [field, order] = sortOptionValue.split('_') as [SortField, SortOrder]

    return chain(markets)
      .sortBy((market) => STATUS_VALUE_MAP[field](market))
      .thru((sorted) => (order === 'desc' ? sorted.reverse() : sorted))
      .value()
  }, [sortOptionValue, markets])

  return {
    sortedMarkets,
    sortParams: {
      option: sortOption,
      onChange: setSortOption,
      options: SORT_OPTIONS,
    },
  }
}
