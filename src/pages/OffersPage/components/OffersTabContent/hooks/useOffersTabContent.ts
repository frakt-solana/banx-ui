import { chain } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { formatDecimal } from '@banx/utils'

import { useUserOffers } from './useUserOffers'

type SearchSelectOption = {
  collectionName: string
  collectionImage: string
  claim: number
}

export const useOffersContent = () => {
  const {
    offers,
    updateOrAddOffer,
    isLoading,
    selectedCollections,
    setSelectedCollections,
    sortParams,
    hasNextPage,
    fetchNextPage,
  } = useUserOffers()

  const searchSelectOptions = chain(offers)
    .map(({ collectionMeta }) => ({
      collectionName: collectionMeta.collectionName,
      collectionImage: collectionMeta.collectionImage,
      claim: 0,
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
    offers,
    isLoading,
    searchSelectParams,
    sortParams,
    showEmptyList,
    updateOrAddOffer,
    hasNextPage,
    fetchNextPage,
  }
}
