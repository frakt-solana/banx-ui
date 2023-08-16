import { useMemo, useState } from 'react'

import { get, sortBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { MarketPreview } from '@banx/api/bonds'

import { defaultSortOption, sortOptions } from '../constants'

enum SortField {
  OFFER_TVL = 'offerTVL',
  LOANS_TVL = 'loansTVL',
  ACTIVE_LOANS = 'activeLoans',
  APY = 'apy',
}

export const useSortMarkets = (markets: MarketPreview[]) => {
  const [sortOption, setSortOption] = useState<SortOption>(defaultSortOption)

  const sortOptionValue = sortOption?.value

  const sortedMarkets = useMemo(() => {
    if (!sortOptionValue) {
      return markets
    }

    const [name, order] = sortOptionValue.split('_')

    const sortValueMapping: Record<SortField, string> = {
      [SortField.OFFER_TVL]: 'offerTVL',
      [SortField.LOANS_TVL]: 'loansTVL',
      [SortField.ACTIVE_LOANS]: 'activeBondsAmount',
      [SortField.APY]: 'apy',
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
      options: sortOptions,
    },
  }
}
