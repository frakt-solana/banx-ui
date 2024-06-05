import { useMemo, useState } from 'react'

import { orderBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { core } from '@banx/api/tokens'

export enum SortField {
  IN_LOANS = 'inLoans',
  IN_OFFERS = 'inOffers',
  INTEREST = 'interest',
  APR = 'apr',
}

type SortValueGetter = (offer: core.TokenOfferPreview) => number

const SORT_OPTIONS: SortOption<SortField>[] = [
  { label: 'In loans', value: [SortField.IN_LOANS, 'desc'] },
  { label: 'In offers', value: [SortField.IN_OFFERS, 'desc'] },
  { label: 'Interest', value: [SortField.INTEREST, 'desc'] },
  { label: 'APR', value: [SortField.APR, 'desc'] },
]

const SORT_VALUE_MAP: Record<SortField, SortValueGetter> = {
  [SortField.IN_LOANS]: (offer) => offer.tokenOfferPreview.inLoans,
  [SortField.IN_OFFERS]: (offer) => offer.tokenOfferPreview.offerSize,
  [SortField.INTEREST]: (offer) => offer.tokenOfferPreview.accruedInterest,
  [SortField.APR]: (offer) => offer.tokenMarketPreview.marketApr,
}

export const useSortedOffers = (offers: core.TokenOfferPreview[]) => {
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0])

  const sortedOffers = useMemo(() => {
    if (!sortOption) return offers

    const [field, order] = sortOption.value

    const sortValueGetter = SORT_VALUE_MAP[field]
    return orderBy(offers, sortValueGetter, order)
  }, [sortOption, offers])

  const onChangeSortOption = (option: SortOption<SortField>) => {
    setSortOption(option)
  }

  return {
    sortedOffers,
    sortParams: {
      option: sortOption,
      onChange: onChangeSortOption,
      options: SORT_OPTIONS,
    },
  }
}
