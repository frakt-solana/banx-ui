import { useMemo, useState } from 'react'

import { orderBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { UserOffer } from '@banx/api/core'
import { calcSyntheticLoanValue } from '@banx/store'

export enum SortField {
  LTV = 'ltv',
  LENT = 'lent',
  INTEREST = 'interest',
}

type SortValueGetter = (offer: UserOffer) => number

const SORT_OPTIONS: SortOption<SortField>[] = [
  { label: 'LTV', value: [SortField.LTV, 'desc'] },
  { label: 'Lent', value: [SortField.LENT, 'desc'] },
  { label: 'Interest', value: [SortField.INTEREST, 'desc'] },
]

const SORT_VALUE_MAP: Record<SortField, SortValueGetter> = {
  [SortField.LENT]: (offer) => offer.offer.edgeSettlement,
  [SortField.INTEREST]: (offer) => offer.offer.concentrationIndex,
  [SortField.LTV]: (offer) =>
    calcSyntheticLoanValue(offer.offer) / offer.collectionMeta.collectionFloor,
}

export const useSortedOffers = (offers: UserOffer[]) => {
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
