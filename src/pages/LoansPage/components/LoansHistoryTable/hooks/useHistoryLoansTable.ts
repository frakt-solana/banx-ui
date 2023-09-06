import { useEffect, useMemo } from 'react'

import { first, groupBy, map, sumBy } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { useIntersection } from '@banx/hooks'

import { useBorrowerActivity } from './useBorrowerActivity'

import styles from '../LoansHistoryTable.module.less'

interface SearchSelectOption {
  collectionName: string
  collectionImage: string
  borrowed: number
}

export const useHistoryLoansTable = () => {
  const { ref: fetchMoreTrigger, inView } = useIntersection()

  const {
    loans,
    isLoading,
    sortParams,
    selectedCollections,
    setSelectedCollections,
    fetchNextPage,
    hasNextPage,
  } = useBorrowerActivity()

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, fetchNextPage, hasNextPage])

  const searchSelectOptions = useMemo(() => {
    const loansGroupedByCollection = groupBy(loans, (loans) => loans.nft.meta.collectionName)

    return map(loansGroupedByCollection, (groupedLoans) => {
      const firstLoanInGroup = first(groupedLoans)
      const { collectionName = '', collectionImage = '' } = firstLoanInGroup?.nft.meta || {}
      const borrowed = sumBy(groupedLoans, (nft) => nft.borrowed)

      return { collectionName, collectionImage, borrowed }
    })
  }, [loans])

  const searchSelectParams: SearchSelectProps<SearchSelectOption> = {
    options: searchSelectOptions,
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'borrowed',
        format: (value: number) => createSolValueJSX(value, 1e9),
      },
    },
    selectedOptions: selectedCollections,
    labels: ['Collection', 'Borrowed'],
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
