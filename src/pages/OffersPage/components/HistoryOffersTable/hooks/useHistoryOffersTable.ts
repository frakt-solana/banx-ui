import { useEffect } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useNavigate } from 'react-router-dom'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { useIntersection } from '@banx/hooks'
import { PATHS } from '@banx/router'

import { EMPTY_MESSAGE, NOT_CONNECTED_MESSAGE } from '../constants'
import { useLenderActivity } from './useLenderActivity'
import { useLenderActivityCollectionsList } from './useLenderActivityCollectionsList'

import styles from '../HistoryOffersTable.module.less'

export const useHistoryOffersTable = () => {
  const { ref: fetchMoreTrigger, inView } = useIntersection()
  const { connected } = useWallet()
  const navigate = useNavigate()

  const { data: collectionsList } = useLenderActivityCollectionsList()

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

  const searchSelectParams = {
    options: collectionsList,
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

  const showEmptyList = (!loans?.length && !isLoading) || !connected
  const showSummary = !!loans.length && !isLoading

  const goToLendPage = () => {
    navigate(PATHS.LEND)
  }

  const emptyListParams = {
    message: connected ? EMPTY_MESSAGE : NOT_CONNECTED_MESSAGE,
    buttonProps: connected ? { text: 'Lend', onClick: goToLendPage } : undefined,
  }

  return {
    loans,
    loading: isLoading,
    showEmptyList,
    showSummary,
    emptyListParams,
    sortViewParams: {
      searchSelectParams,
      sortParams,
    },
    fetchMoreTrigger,
  }
}
