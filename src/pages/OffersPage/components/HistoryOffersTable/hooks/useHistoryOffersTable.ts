import { useMemo, useState } from 'react'

import { first, groupBy, map, sumBy } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { SortOption } from '@banx/components/SortDropdown'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { useLenderLoansAndOffers } from '../../ActiveOffersTable/hooks'
import { DEFAULT_SORT_OPTION } from '../constants'

interface SearchSelectOption {
  collectionName: string
  collectionImage: string
  received: number
}

export const useHistoryOffersTable = () => {
  const { loans, loading } = useLenderLoansAndOffers()

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const searchSelectOptions = useMemo(() => {
    const loansGroupedByCollection = groupBy(loans, ({ nft }) => nft.meta.collectionName)

    return map(loansGroupedByCollection, (groupedLoan) => {
      const firstLoanInGroup = first(groupedLoan)
      const { collectionName = '', collectionImage = '' } = firstLoanInGroup?.nft.meta || {}
      const received = sumBy(groupedLoan, (nft) => nft.bondTradeTransaction.solAmount)

      return { collectionName, collectionImage, received }
    })
  }, [loans])

  const searchSelectParams: SearchSelectProps<SearchSelectOption> = {
    options: searchSelectOptions,
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'received',
        format: (value: number) => createSolValueJSX(value, 1e9),
      },
    },
    selectedOptions,
    labels: ['Collection', 'Received'],
    onChange: setSelectedOptions,
  }

  const sortParams = {
    option: sortOption,
    onChange: setSortOption,
  }

  return {
    loans,
    loading,
    sortViewParams: {
      searchSelectParams,
      sortParams,
    },
  }
}
