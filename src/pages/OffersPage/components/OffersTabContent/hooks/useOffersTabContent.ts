import { useState } from 'react'

import { sumBy } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { formatDecimal } from '@banx/utils'

import { caclulateClaimValue } from '../components/OfferCard/helpers'
import { useLenderLoansAndOffers } from './useLenderLoansAndOffers'
import { useSortedOffers } from './useSortedOffers'

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
        format: (value: number) => createSolValueJSX(value, 1e9, '0◎', formatDecimal),
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
