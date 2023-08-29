import { useMemo, useState } from 'react'

import { first, groupBy, map } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { SortOption } from '@banx/components/SortDropdown'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { DEFAULT_SORT_OPTION } from '@banx/pages/LoansPage/constants'
import { calculateLoanValue } from '@banx/utils'

import { useUserOffers } from './useUserOffers'

interface SearchSelectOption {
  collectionName: string
  collectionImage: string
  bestOffer: number
}

export const usePendingOfferTable = () => {
  const { offers, loading } = useUserOffers()
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const searchSelectOptions = useMemo(() => {
    const offersGroupedByCollection = groupBy(offers, (offer) => offer.collectionName)

    return map(offersGroupedByCollection, (groupedOffers) => {
      const firstLoanInGroup = first(groupedOffers)
      const { collectionName = '', collectionImage = '' } = firstLoanInGroup || {}

      const sortedOffers = groupedOffers.sort((offerA, offerB) => {
        return calculateLoanValue(offerB) - calculateLoanValue(offerA)
      })

      const bestOfferLoanValue = calculateLoanValue(sortedOffers[0])

      return { collectionName, collectionImage, bestOffer: bestOfferLoanValue }
    })
  }, [offers])

  const searchSelectParams: SearchSelectProps<SearchSelectOption> = {
    options: searchSelectOptions,
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'bestOffer',
        format: (value: number) => createSolValueJSX(value, 1e9),
      },
    },
    selectedOptions,
    labels: ['Collection', 'Best offer'],
    onChange: setSelectedOptions,
  }

  const sortParams = {
    option: sortOption,
    onChange: setSortOption,
  }

  return {
    offers,
    loading,
    sortViewParams: {
      searchSelectParams,
      sortParams,
    },
  }
}
