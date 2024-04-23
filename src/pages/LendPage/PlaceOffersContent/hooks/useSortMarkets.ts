import { useMemo, useState } from 'react'

import { get, sortBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { MarketPreview } from '@banx/api/core'

enum SortField {
  OFFER_TVL = 'offerTvl',
  LOANS_TVL = 'loansTvl',
  ACTIVE_LOANS = 'activeLoans',
}

const SORT_OPTIONS = [
  { label: 'Offers TVL', value: 'offerTvl' },
  { label: 'Loans TVL', value: 'loansTvl' },
  { label: 'Active loans', value: 'activeLoans' },
]

const DEFAULT_SORT_OPTION = { label: 'Loans TVL', value: 'loansTvl_desc' }

export const useSortMarkets = (markets: MarketPreview[]) => {
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const sortOptionValue = sortOption?.value

  const sortedMarkets = useMemo(() => {
    if (!sortOptionValue) {
      return markets
    }

    const [name, order] = sortOptionValue.split('_')

    const sortValueMapping: Record<SortField, string> = {
      [SortField.OFFER_TVL]: 'offerTvl',
      [SortField.LOANS_TVL]: 'loansTvl',
      [SortField.ACTIVE_LOANS]: 'activeBondsAmount',
    }

    const sorted = sortBy(markets, (loan) => {
      const sortValue = sortValueMapping[name as SortField]
      return get(loan, sortValue)
    })

    return order === 'desc' ? sorted.reverse() : sorted
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
