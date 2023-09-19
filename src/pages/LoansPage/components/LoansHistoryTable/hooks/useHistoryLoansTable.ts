import { useEffect } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { useIntersection } from '@banx/hooks'
import { PATHS } from '@banx/router'

import { EMPTY_MESSAGE, NOT_CONNECTED_MESSAGE } from '../constants'
import { useBorrowerActivity } from './useBorrowerActivity'
import { useBorrowerActivityCollectionsList } from './useBorrowerActivityCollectionsList'

import styles from '../LoansHistoryTable.module.less'

export const useHistoryLoansTable = () => {
  const { ref: fetchMoreTrigger, inView } = useIntersection()
  const { connected } = useWallet()

  const { data: collectionsList } = useBorrowerActivityCollectionsList()

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
  }, [inView, hasNextPage, fetchNextPage])

  const searchSelectParams = {
    options: collectionsList,
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

  const showEmptyList = (!loans?.length && !isLoading) || !connected
  const showSummary = !!loans.length && !isLoading

  const emptyListParams = {
    message: connected ? EMPTY_MESSAGE : NOT_CONNECTED_MESSAGE,
    buttonText: connected ? 'Borrow' : '',
    path: connected ? PATHS.BORROW : '',
  }

  return {
    loans,
    loading: isLoading,
    showSummary,
    showEmptyList,
    emptyListParams,
    sortViewParams: {
      searchSelectParams,
      sortParams,
    },
    fetchMoreTrigger,
  }
}
