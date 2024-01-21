import { useMemo } from 'react'

import { chain } from 'lodash'

import { MarketPreview } from '@banx/api/core'
import { createSortParams, useSort } from '@banx/store'

enum SortField {
  OFFERS_TVL = 'offerTvl',
  LOANS_TVL = 'loansTvl',
  ACTIVE_LOANS = 'activeLoans',
  APR = 'apr',
}

type SortValueGetter = (market: MarketPreview) => number
type StatusValueMap = Record<string, SortValueGetter>

const SORT_OPTIONS = [
  { label: 'Offers TVL', value: SortField.OFFERS_TVL },
  { label: 'Loans TVL', value: SortField.LOANS_TVL },
  { label: 'Active loans', value: SortField.ACTIVE_LOANS },
  { label: 'APR', value: SortField.APR },
]

const DEFAULT_SORT_OPTION = { label: 'Loans TVL', value: 'loansTvl_desc' }

const STATUS_VALUE_MAP: StatusValueMap = {
  [SortField.OFFERS_TVL]: (market) => market.offerTvl,
  [SortField.LOANS_TVL]: (market) => market.loansTvl,
  [SortField.ACTIVE_LOANS]: (market) => market.activeBondsAmount,
  [SortField.APR]: (market) => market.marketApr,
}

const SORT_STORAGE_KEY = '@banx.sort.lend'

export const useSortMarkets = (markets: MarketPreview[]) => {
  const { value: defaultOptionValue } = DEFAULT_SORT_OPTION
  const { sortOptionValue, setSortOptionValue } = useSort(SORT_STORAGE_KEY, defaultOptionValue)

  const sortedMarkets = useMemo(() => {
    if (!sortOptionValue) return markets

    const [field, order] = sortOptionValue.split('_')

    return chain(markets)
      .sortBy((market) => STATUS_VALUE_MAP[field](market))
      .thru((sorted) => (order === 'desc' ? sorted.reverse() : sorted))
      .value()
  }, [sortOptionValue, markets])

  const sortParams = useMemo(() => {
    return createSortParams({
      sortOptionValue,
      setSortOptionValue,
      defaultOption: DEFAULT_SORT_OPTION,
      options: SORT_OPTIONS,
    })
  }, [setSortOptionValue, sortOptionValue])

  return { sortedMarkets, sortParams }
}
