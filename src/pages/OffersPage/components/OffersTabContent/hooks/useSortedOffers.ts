import { useMemo, useState } from 'react'

import { chain } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { UserOffer } from '@banx/api/core'
import { calcSyntheticLoanValue } from '@banx/store'

enum SortField {
  LENT = 'lent',
  INTEREST = 'interest',
  LTV = 'ltv',
}

const SORT_OPTIONS = [
  { label: 'LTV', value: SortField.LTV },
  { label: 'Lent', value: SortField.LENT },
  { label: 'Interest', value: SortField.INTEREST },
]

const DEFAULT_SORT_OPTION: SortOption = {
  label: SORT_OPTIONS[0].label,
  value: `${SORT_OPTIONS[0].value}_desc`,
}

type SortValueGetter = (offer: UserOffer) => number
type StatusValueMap = Record<SortField, string | SortValueGetter>

const STATUS_VALUE_MAP: StatusValueMap = {
  [SortField.LENT]: ({ offer }) => offer.edgeSettlement,
  [SortField.INTEREST]: ({ offer }) => offer.concentrationIndex,
  [SortField.LTV]: ({ offer, collectionMeta }) =>
    calcSyntheticLoanValue(offer) / collectionMeta.collectionFloor,
}

export const useSortedOffers = (offers: UserOffer[]) => {
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const sortOptionValue = sortOption?.value

  const sortedOffers = useMemo(() => {
    if (!sortOptionValue) return offers

    const [field, order] = sortOptionValue.split('_')

    return chain(offers)
      .sortBy((offer) => (STATUS_VALUE_MAP[field as SortField] as SortValueGetter)(offer))
      .thru((sorted) => (order === 'desc' ? sorted.reverse() : sorted))
      .value()
  }, [sortOptionValue, offers])

  return {
    sortedOffers,
    sortParams: {
      option: sortOption,
      onChange: setSortOption,
      options: SORT_OPTIONS,
    },
  }
}
