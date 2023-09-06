import { useEffect, useMemo } from 'react'

import { first, groupBy, map, sumBy } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { useIntersection } from '@banx/hooks'

import { useLenderActivity } from './useLenderActivity'

import styles from '../HistoryOffersTable.module.less'

interface SearchSelectOption {
  collectionName: string
  collectionImage: string
  received: number
}

export const useHistoryOffersTable = () => {
  const { ref: fetchMoreTrigger, inView } = useIntersection()

  const {
    loans,
    isLoading,
    sortParams,
    selectedCollections,
    setSelectedCollections,
    fetchNextPage,
    hasNextPage,
  } = useLenderActivity()

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, fetchNextPage, hasNextPage])

  const searchSelectOptions = useMemo(() => {
    const loansGroupedByCollection = groupBy(loans, ({ nft }) => nft.meta.collectionName)

    return map(loansGroupedByCollection, (groupedLoan) => {
      const firstLoanInGroup = first(groupedLoan)
      const { collectionName = '', collectionImage = '' } = firstLoanInGroup?.nft.meta || {}
      const received = sumBy(groupedLoan, (nft) => nft.received)

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
    selectedOptions: selectedCollections,
    labels: ['Collection', 'Received'],
    onChange: setSelectedCollections,
    className: styles.searchSelect,
  }

  return {
    loans,
    loading: isLoading,
    sortViewParams: {
      searchSelectParams,
      sortParams,
    },
    fetchMoreTrigger,
  }
}
