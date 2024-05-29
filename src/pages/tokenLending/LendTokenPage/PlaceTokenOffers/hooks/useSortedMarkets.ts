import { useMemo, useState } from 'react'

import { orderBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { core } from '@banx/api/tokens'

export enum SortField {
  OFFER_TVL = 'offerTvl',
  LOANS_TVL = 'loansTvl',
  ACTIVE_LOANS = 'activeLoans',
}

const SORT_OPTIONS: SortOption<SortField>[] = [
  { label: 'Loans TVL', value: [SortField.LOANS_TVL, 'desc'] },
  { label: 'Offers TVL', value: [SortField.OFFER_TVL, 'desc'] },
  { label: 'Active loans', value: [SortField.ACTIVE_LOANS, 'desc'] },
]

type SortValueGetter = (market: core.TokenMarketPreview) => number

const SORT_VALUE_MAP: Record<SortField, SortValueGetter> = {
  [SortField.OFFER_TVL]: (market) => market.offersTvl,
  [SortField.LOANS_TVL]: (market) => market.loansTvl,
  [SortField.ACTIVE_LOANS]: (market) => market.activeLoansAmount,
}

export const useSortedMarkets = (markets: core.TokenMarketPreview[]) => {
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0])

  const sortedMarkets = useMemo(() => {
    if (!sortOption) return markets

    const [field, order] = sortOption.value

    const sortValueGetter = SORT_VALUE_MAP[field]
    return orderBy(markets, sortValueGetter, order)
  }, [sortOption, markets])

  const onChangeSortOption = (option: SortOption<SortField>) => {
    setSortOption(option)
  }

  return {
    sortedMarkets,
    sortParams: {
      option: sortOption,
      onChange: onChangeSortOption,
      options: SORT_OPTIONS,
    },
  }
}
