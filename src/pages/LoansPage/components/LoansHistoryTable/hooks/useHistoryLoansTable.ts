import { useWallet } from '@solana/wallet-adapter-react'
import { useNavigate } from 'react-router-dom'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { PATHS } from '@banx/router'

import { EMPTY_MESSAGE, NOT_CONNECTED_MESSAGE } from '../constants'
import { useBorrowerActivity } from './useBorrowerActivity'
import { useBorrowerActivityCollectionsList } from './useBorrowerActivityCollectionsList'

import styles from '../LoansHistoryTable.module.less'

export const useHistoryLoansTable = () => {
  const { connected } = useWallet()
  const navigate = useNavigate()

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

  const loadMore = () => {
    if (hasNextPage) {
      fetchNextPage()
    }
  }

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

  const goToBorrowPage = () => {
    navigate(PATHS.BORROW)
  }

  const emptyListParams = {
    message: connected ? EMPTY_MESSAGE : NOT_CONNECTED_MESSAGE,
    buttonProps: connected ? { text: 'Borrow', onClick: goToBorrowPage } : undefined,
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
    loadMore,
  }
}
