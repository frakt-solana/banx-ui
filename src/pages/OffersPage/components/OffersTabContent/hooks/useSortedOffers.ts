import { useMemo } from 'react'

import { chain } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { UserOffer } from '@banx/api/core'
import { useLocalStorage } from '@banx/hooks'
import { calcSyntheticLoanValue } from '@banx/store'
import { SORT_STORAGE_KEY, createSortParams } from '@banx/utils'

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
  const { value: defaultOptionValue } = DEFAULT_SORT_OPTION
  const [sortOptionValue, setSortOptionValue] = useLocalStorage(
    SORT_STORAGE_KEY.LENDER_OFFERS,
    defaultOptionValue,
  )

  const sortedOffers = useMemo(() => {
    if (!sortOptionValue) return offers

    const [field, order] = sortOptionValue.split('_')

    return chain(offers)
      .sortBy((offer) => (STATUS_VALUE_MAP[field as SortField] as SortValueGetter)(offer))
      .thru((sorted) => (order === 'desc' ? sorted.reverse() : sorted))
      .value()
  }, [sortOptionValue, offers])

  const sortParams = useMemo(() => {
    return createSortParams({
      sortOptionValue,
      setSortOptionValue,
      defaultOption: DEFAULT_SORT_OPTION,
      options: SORT_OPTIONS,
    })
  }, [setSortOptionValue, sortOptionValue])

  return { sortedOffers, sortParams }
}
