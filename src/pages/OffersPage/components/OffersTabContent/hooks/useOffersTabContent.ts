import { useMemo, useState } from 'react'

import { chain, filter, includes } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { SortOption } from '@banx/components/SortDropdown'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { formatDecimal } from '@banx/utils'

import { useUserOffers } from './useUserOffers'

type SearchSelectOption = {
  collectionName: string
  collectionImage: string
  claim: number
}

export const useOffersContent = () => {
  const { offers, updateOrAddOffer, isLoading } = useUserOffers()

  const [currentOption, setCurrentOption] = useState<SortOption>(DEFAULT_SORT_OPTION)
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])

  const sortParams = {
    onChange: setCurrentOption,
    option: currentOption,
    options: SORT_OPTIONS,
  }

  const filteredOffers = useMemo(() => {
    if (selectedCollections.length) {
      return filter(offers, ({ collectionMeta }) =>
        includes(selectedCollections, collectionMeta.collectionName),
      )
    }
    return offers
  }, [offers, selectedCollections])

  const searchSelectOptions = chain(offers)
    .map(({ collectionMeta }) => ({
      collectionName: collectionMeta.collectionName,
      collectionImage: collectionMeta.collectionImage,
      claim: 0, //TODO: need to calc claim or smth another?
    }))
    .uniqBy(({ collectionName }) => collectionName)
    .value()

  const searchSelectParams: SearchSelectProps<SearchSelectOption> = {
    options: searchSelectOptions,
    selectedOptions: selectedCollections,
    labels: ['Collection', 'Claim'],
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'claim',
        format: (value: number) => createSolValueJSX(value, 1e9, '0◎', formatDecimal),
      },
    },
    onChange: setSelectedCollections,
  }

  const showEmptyList = !isLoading && !offers.length

  return {
    offers: filteredOffers,
    isLoading,
    searchSelectParams,
    sortParams,
    showEmptyList,
    updateOrAddOffer,
  }
}

const SORT_OPTIONS = [
  { label: 'Claim', value: 'claim' },
  { label: 'Lent', value: 'lent' },
  { label: 'Offer', value: 'offer' },
]

export const DEFAULT_SORT_OPTION = {
  label: SORT_OPTIONS[1].label,
  value: `${SORT_OPTIONS[1].value}_desc`,
}
