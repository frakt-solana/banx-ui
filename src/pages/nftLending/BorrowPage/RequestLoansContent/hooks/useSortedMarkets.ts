import { useMemo, useState } from 'react'

import { orderBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { coreNew } from '@banx/api/nft'

export enum SortField {
  LOANS_TVL = 'loansTvl',
  ACTIVE_LOANS = 'activeLoans',
  FLOOR = 'floor',
}

type SortValueGetter = (market: coreNew.MarketPreview) => number

const SORT_OPTIONS: SortOption<SortField>[] = [
  { label: 'Loans TVL', value: [SortField.LOANS_TVL, 'desc'] },
  { label: 'Active loans', value: [SortField.ACTIVE_LOANS, 'desc'] },
  { label: 'Floor', value: [SortField.FLOOR, 'desc'] },
]

const SORT_VALUE_MAP: Record<SortField, SortValueGetter> = {
  [SortField.LOANS_TVL]: (market) => market.loansTvl.toNumber(),
  [SortField.ACTIVE_LOANS]: (market) => market.activeBondsAmount,
  [SortField.FLOOR]: (market) => market.collectionFloor.toNumber(),
}

export const useSortedMarkets = (markets: coreNew.MarketPreview[]) => {
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
