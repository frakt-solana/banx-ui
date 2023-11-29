import { useMemo, useState } from 'react'

import { get, sortBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { MarketPreview } from '@banx/api/core'

import { DEFAULT_SORT_OPTION, SORT_OPTIONS } from '../constants'

enum SortField {
  OFFER_TVL = 'offerTvl',
  LOANS_TVL = 'loansTvl',
  ACTIVE_LOANS = 'activeLoans',
  APR = 'apy',
}

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
      [SortField.APR]: 'marketApr',
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
