import { useWallet } from '@solana/wallet-adapter-react'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { useNavigate } from 'react-router-dom'

import { DisplayValue } from '@banx/components/TableComponents'

import { PATHS } from '@banx/router'
import { buildUrlWithModeAndToken } from '@banx/store'
import { AssetMode, useTokenType } from '@banx/store/common'

import {
  useBorrowerTokenActivity,
  useBorrowerTokenActivityCollectionsList,
} from './useTokenBorrowerActivity'

import styles from '../BorrowerTokenActivityTable.module.less'

export const useBorrowerTokenActivityTable = () => {
  const { connected } = useWallet()
  const navigate = useNavigate()
  const { tokenType } = useTokenType()

  const { data: collectionsList } = useBorrowerTokenActivityCollectionsList()

  const {
    loans,
    isLoading,
    sortParams,
    selectedCollections,
    setSelectedCollections,
    fetchNextPage,
    hasNextPage,
  } = useBorrowerTokenActivity()

  const loadMore = () => {
    if (hasNextPage) {
      fetchNextPage()
    }
  }

  const searchSelectParams = {
    labels: ['Collection', 'Borrowed'],
    options: collectionsList,
    selectedOptions: selectedCollections,
    onChange: setSelectedCollections,
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'borrowed',
        format: (value: number) => <DisplayValue value={value} />,
      },
    },
    className: styles.searchSelect,
  }

  const showEmptyList = (!loans?.length && !isLoading) || !connected
  const showSummary = !!loans.length && !isLoading

  const goToBorrowPage = () => {
    navigate(buildUrlWithModeAndToken(PATHS.BORROW, AssetMode.Token, tokenType))
  }

  const emptyListParams = {
    message: connected ? EMPTY_MESSAGE[tokenType] : NOT_CONNECTED_MESSAGE,
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

const NOT_CONNECTED_MESSAGE = 'Connect wallet to view your loan history'

const EMPTY_MESSAGE: Record<LendingTokenType, string> = {
  [LendingTokenType.NativeSol]:
    'Once you have borrowed some SOL, your loan history will appear here',
  [LendingTokenType.BanxSol]: 'Once you have borrowed some SOL, your loan history will appear here',
  [LendingTokenType.Usdc]: 'Once you have borrowed some USDC, your loan history will appear here',
}
