import { useWallet } from '@solana/wallet-adapter-react'
import { useNavigate } from 'react-router-dom'

import { DisplayValue } from '@banx/components/TableComponents'

import { PATHS } from '@banx/router'
import { createPathWithTokenParam, useTokenType } from '@banx/store/nft'

import { EMPTY_MESSAGE, NOT_CONNECTED_MESSAGE } from '../constants'
import { useLenderActivity } from './useLenderActivity'
import { useLenderActivityCollectionsList } from './useLenderActivityCollectionsList'

import styles from '../HistoryOffersTable.module.less'

export const useHistoryOffersTable = () => {
  const { connected } = useWallet()
  const navigate = useNavigate()

  const { tokenType } = useTokenType()

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
        key: 'received',
        format: (value: number) => <DisplayValue value={value} />,
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
    navigate(createPathWithTokenParam(PATHS.LEND, tokenType))
  }

  const emptyListParams = {
    message: connected ? EMPTY_MESSAGE[tokenType] : NOT_CONNECTED_MESSAGE,
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
    loadMore,
  }
}
