import { useWallet } from '@solana/wallet-adapter-react'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { useNavigate } from 'react-router-dom'

import { DisplayValue } from '@banx/components/TableComponents'

import { PATHS } from '@banx/router'
import { buildUrlWithModeAndToken } from '@banx/store'
import { AssetMode, useTokenType } from '@banx/store/common'

import {
  useLenderTokenActivity,
  useLenderTokenActivityCollectionsList,
} from './useLenderTokenActivity'

import styles from '../LenderTokenActivityTable.module.less'

export const useLenderTokenActivityTable = () => {
  const { connected } = useWallet()
  const navigate = useNavigate()

  const { tokenType } = useTokenType()

  const { data: collectionsList } = useLenderTokenActivityCollectionsList()

  const {
    loans,
    isLoading,
    sortParams,
    selectedCollections,
    setSelectedCollections,
    fetchNextPage,
    hasNextPage,
  } = useLenderTokenActivity()

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
    navigate(buildUrlWithModeAndToken(PATHS.LEND_TOKEN, AssetMode.Token, tokenType))
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

const NOT_CONNECTED_MESSAGE = 'Connect wallet to view your lending history'

const EMPTY_MESSAGE = {
  [LendingTokenType.NativeSol]: 'Lend SOL to view your lending history',
  [LendingTokenType.BanxSol]: 'Lend SOL to view your lending history',
  [LendingTokenType.Usdc]: 'Lend USDC to view your lending history',
}
