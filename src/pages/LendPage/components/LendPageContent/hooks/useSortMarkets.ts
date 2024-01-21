import { useMemo } from 'react'

import { MarketPreview } from '@banx/api/core'
import { useLocalStorage } from '@banx/hooks'
import {
  SORT_STORAGE_KEY,
  SortOrder,
  SortValueMap,
  createSortParams,
  sortDataByValueMap,
} from '@banx/utils'

enum SortField {
  OFFERS_TVL = 'offerTvl',
  LOANS_TVL = 'loansTvl',
  ACTIVE_LOANS = 'activeLoans',
  APR = 'apr',
}

const SORT_OPTIONS = [
  { label: 'Offers TVL', value: SortField.OFFERS_TVL },
  { label: 'Loans TVL', value: SortField.LOANS_TVL },
  { label: 'Active loans', value: SortField.ACTIVE_LOANS },
  { label: 'APR', value: SortField.APR },
]

const DEFAULT_SORT_OPTION = {
  label: 'Loans TVL',
  value: `${SortField.LOANS_TVL}_${SortOrder.DESC}`,
}

const SORT_VALUE_MAP: SortValueMap<MarketPreview> = {
  [SortField.OFFERS_TVL]: (market) => market.offerTvl,
  [SortField.LOANS_TVL]: (market) => market.loansTvl,
  [SortField.ACTIVE_LOANS]: (market) => market.activeBondsAmount,
  [SortField.APR]: (market) => market.marketApr,
}

export const useSortMarkets = (markets: MarketPreview[]) => {
  const [sortOptionValue, setSortOptionValue] = useLocalStorage(
    SORT_STORAGE_KEY.LEND,
    DEFAULT_SORT_OPTION.value,
  )

  const sortedMarkets = useMemo(() => {
    return sortDataByValueMap(markets, sortOptionValue, SORT_VALUE_MAP)
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
