import { useMemo } from 'react'

import { UserOffer } from '@banx/api/core'
import { useLocalStorage } from '@banx/hooks'
import { calcSyntheticLoanValue } from '@banx/store'
import {
  SORT_STORAGE_KEY,
  SortOrder,
  SortValueMap,
  createSortParams,
  sortDataByValueMap,
} from '@banx/utils'

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

const DEFAULT_SORT_OPTION = {
  label: 'LTV',
  value: `${SortField.LTV}_${SortOrder.DESC}`,
}

const SORT_VALUE_MAP: SortValueMap<UserOffer> = {
  [SortField.LENT]: ({ offer }) => offer.edgeSettlement,
  [SortField.INTEREST]: ({ offer }) => offer.concentrationIndex,
  [SortField.LTV]: ({ offer, collectionMeta }) =>
    calcSyntheticLoanValue(offer) / collectionMeta.collectionFloor,
}

export const useSortedOffers = (offers: UserOffer[]) => {
  const [sortOptionValue, setSortOptionValue] = useLocalStorage(
    SORT_STORAGE_KEY.LENDER_OFFERS,
    DEFAULT_SORT_OPTION.value,
  )

  const sortedOffers = useMemo(() => {
    return sortDataByValueMap(offers, sortOptionValue, SORT_VALUE_MAP)
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
