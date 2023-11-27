import { useMemo, useState } from 'react'

import { get, sortBy, sumBy } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { SortOption } from '@banx/components/SortDropdown'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { Offer } from '@banx/api/core'

import { useLenderLoansAndOffers } from './components/ActiveOffersTable/hooks'
import { caclulateClaimValue } from './components/OfferCard/helpers'
import { DEFAULT_SORT_OPTION, SORT_OPTIONS } from './constants'

type SearchSelectOption = {
  collectionName: string
  collectionImage: string
  claim: number
}

export const useOffersTabContent = () => {
  const { data, loading: isLoading } = useLenderLoansAndOffers()

  const [selectedOffers, setSelectedOffers] = useState<string[]>([])
  const { sortParams } = useSortedOffers(data.map(({ offer }) => offer))

  const searchSelectOptions = data.map(({ loans, collectionMeta }) => {
    return {
      collectionName: collectionMeta.collectionName,
      collectionImage: collectionMeta.collectionImage,
      claim: sumBy(loans, caclulateClaimValue),
    }
  })

  const searchSelectParams: SearchSelectProps<SearchSelectOption> = {
    options: searchSelectOptions,
    selectedOptions: selectedOffers,
    labels: ['Collection', 'Claim'],
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'claim',
        format: (value: number) => createSolValueJSX(value, 1e9),
      },
    },
    onChange: setSelectedOffers,
  }

  const showEmptyList = !isLoading && !data.length

  return {
    data,
    isLoading,
    searchSelectParams,
    sortParams,
    showEmptyList,
  }
}

enum SortField {
  CLAIM = 'claim',
}

export const useSortedOffers = (offers: Offer[]) => {
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const sortOptionValue = sortOption?.value

  const sortedMarkets = useMemo(() => {
    if (!sortOptionValue) return offers

    const [name, order] = sortOptionValue.split('_')

    const sortValueMapping: Record<SortField, string> = {
      [SortField.CLAIM]: 'claim',
    }

    const sorted = sortBy(offers, (loan) => {
      const sortValue = sortValueMapping[name as SortField]
      return get(loan, sortValue)
    })

    return order === 'desc' ? sorted.reverse() : sorted
  }, [sortOptionValue, offers])

  return {
    sortedMarkets,
    sortParams: {
      option: sortOption,
      onChange: setSortOption,
      options: SORT_OPTIONS,
    },
  }
}
