import { useEffect } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useNavigate } from 'react-router-dom'

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

  const goToBorrowPage = () => {
    navigate(PATHS.BORROW)
  }

  const emptyListParams = {
    message: connected ? EMPTY_MESSAGE : NOT_CONNECTED_MESSAGE,
    buttonProps: {
      text: connected ? 'Borrow' : '',
      onClick: connected ? goToBorrowPage : undefined,
    },
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
