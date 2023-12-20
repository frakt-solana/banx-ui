import { useMemo, useState } from 'react'

import { chain, filter, includes } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { formatDecimal } from '@banx/utils'

import { useSortedOffers } from './useSortedOffers'
import { useUserOffers } from './useUserOffers'

type SearchSelectOption = {
  collectionName: string
  collectionImage: string
  claim: number
}

export const useOffersContent = () => {
  const { offers, updateOrAddOffer, isLoading } = useUserOffers()

  const [selectedCollections, setSelectedCollections] = useState<string[]>([])

  const filteredOffers = useMemo(() => {
    if (selectedCollections.length) {
      return filter(offers, ({ collectionMeta }) =>
        includes(selectedCollections, collectionMeta.collectionName),
      )
    }
    return offers
  }, [offers, selectedCollections])

  const { sortParams, sortedOffers } = useSortedOffers(filteredOffers)

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
    offers: sortedOffers,
    isLoading,
    searchSelectParams,
    sortParams,
    showEmptyList,
    updateOrAddOffer,
  }
}
