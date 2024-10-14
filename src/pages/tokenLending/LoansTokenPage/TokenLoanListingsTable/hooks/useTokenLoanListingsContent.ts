import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { filter, first, groupBy, map } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { TokenLoan } from '@banx/api/tokens'
import { BorrowTokenTabName } from '@banx/pages/tokenLending/BorrowTokenPage/BorrowTokenPage'
import { useBorrowTokenTabs } from '@banx/pages/tokenLending/BorrowTokenPage/hooks'
import { PATHS } from '@banx/router'
import { buildUrlWithModeAndToken, createGlobalState } from '@banx/store'
import { AssetMode, useTokenType } from '@banx/store/common'

import { useSortTokenLoanListings } from './useSortTokenLoanListings'
import { useUserTokenLoanListings } from './useUserTokenLoanListings'

import styles from '../TokenLoanListingsTable.module.less'

const useCollectionsStore = createGlobalState<string[]>([])

export const useTokenLoanListingsContent = () => {
  const { loans, isLoading } = useUserTokenLoanListings()

  const { connected } = useWallet()
  const navigate = useNavigate()

  const { tokenType } = useTokenType()

  const [selectedCollections, setSelectedCollections] = useCollectionsStore()

  const { setTab: setBorrowTab } = useBorrowTokenTabs()

  const filteredLoansBySelectedCollections = useMemo(() => {
    if (!selectedCollections.length) return loans

    return filter(loans, ({ collateral }) => selectedCollections.includes(collateral.ticker))
  }, [loans, selectedCollections])

  const { sortedLoans, sortParams } = useSortTokenLoanListings(filteredLoansBySelectedCollections)

  const searchSelectParams = createSearchSelectParams({
    loans: filteredLoansBySelectedCollections,
    selectedOptions: selectedCollections,
    onChange: setSelectedCollections,
  })

  const goToBorrowPage = () => {
    setBorrowTab(BorrowTokenTabName.LIST)
    navigate(buildUrlWithModeAndToken(PATHS.BORROW, AssetMode.Token, tokenType))
  }

  const emptyListParams = {
    message: createEmptyMessage(connected),
    buttonProps: connected ? { text: 'List loan', onClick: goToBorrowPage } : undefined,
  }

  const showEmptyList = (!loans.length && !isLoading) || !connected
  const showSummary = !!loans.length && !isLoading

  return {
    loans: sortedLoans,
    loading: isLoading,

    showSummary,

    showEmptyList,
    emptyListParams,

    sortViewParams: {
      searchSelectParams,
      sortParams,
    },
  }
}

const createEmptyMessage = (connected: boolean) => {
  return connected ? 'List your tokens with terms you want' : 'Connect wallet to see your listings'
}

type CreateSearchSelectProps = {
  loans: TokenLoan[]
  selectedOptions: string[]
  onChange: (option: string[]) => void
}

const createSearchSelectParams = ({
  loans,
  selectedOptions,
  onChange,
}: CreateSearchSelectProps) => {
  const loansGroupedByMint = groupBy(loans, ({ collateral }) => collateral.mint)

  const searchSelectOptions = map(loansGroupedByMint, (groupedLoans) => {
    const firstLoanInGroup = first(groupedLoans)
    const { ticker = '', logoUrl = '' } = firstLoanInGroup?.collateral || {}
    const loansAmount = groupedLoans.length

    return { ticker, logoUrl, loansAmount }
  })

  const searchSelectParams = {
    options: searchSelectOptions,
    selectedOptions,
    onChange,
    optionKeys: {
      labelKey: 'ticker',
      valueKey: 'ticker',
      imageKey: 'logoUrl',
      secondLabel: { key: 'loansAmount' },
    },
    labels: ['Collection', 'Token'],
    className: styles.searchSelect,
  }

  return searchSelectParams
}
