import { useWallet } from '@solana/wallet-adapter-react'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { first, groupBy, map } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { SearchSelectProps } from '@banx/components/SearchSelect'

import { Loan } from '@banx/api/core'
import { PATHS } from '@banx/router'
import { createPathWithTokenParam, useTokenType } from '@banx/store'

import { useFilterLoans } from './useFilteredLoans'
import { useSortLoans } from './useSortLoans'

import styles from '../LoansActiveTable.module.less'

export interface SearchSelectOption {
  collectionName: string
  collectionImage: string
  numberOfNFTs: number
}

interface UseLoansActiveTableProps {
  loans: Loan[]
  isLoading: boolean
}

export const useLoansActiveTable = ({ loans, isLoading }: UseLoansActiveTableProps) => {
  const { connected } = useWallet()
  const navigate = useNavigate()

  const { tokenType } = useTokenType()

  const {
    filteredLoansBySelectedCollection,
    filteredAllLoans,
    isTerminationFilterEnabled,
    toggleTerminationFilter,
    selectedCollections,
    setSelectedCollections,
    countOfTerminatingLoans,
    isRepaymentCallFilterEnabled,
    toggleRepaymentCallFilter,
    countOfRepaymentCallLoans,
  } = useFilterLoans(loans)

  const { sortedLoans, sortParams } = useSortLoans(filteredLoansBySelectedCollection)

  const searchSelectParams = createSearchSelectParams({
    loans: filteredAllLoans,
    selectedOptions: selectedCollections,
    onChange: setSelectedCollections,
  })

  const showEmptyList = (!loans?.length && !isLoading) || !connected
  const showSummary = !!loans.length && !isLoading

  const goToBorrowPage = () => {
    navigate(createPathWithTokenParam(PATHS.BORROW, tokenType))
  }

  const emptyListParams = {
    message: MESSAGES[tokenType][connected ? 'connected' : 'notConnected'],
    buttonProps: connected ? { text: 'Borrow', onClick: goToBorrowPage } : undefined,
  }

  return {
    loans: sortedLoans,
    loading: isLoading,

    countOfTerminatingLoans,
    isTerminationFilterEnabled,
    toggleTerminationFilter,

    countOfRepaymentCallLoans,
    isRepaymentCallFilterEnabled,
    toggleRepaymentCallFilter,

    showSummary,
    showEmptyList,
    emptyListParams,

    sortViewParams: { searchSelectParams, sortParams },
  }
}

export const MESSAGES = {
  [LendingTokenType.NativeSol]: {
    connected: 'Borrow SOL against your NFTs',
    notConnected: 'Connect wallet to borrow SOL against your NFTs',
  },
  [LendingTokenType.Usdc]: {
    connected: 'Borrow USDC against your NFTs',
    notConnected: 'Connect wallet to borrow USDC against your NFTs',
  },
}

interface CreateSearchSelectProps {
  loans: Loan[]
  selectedOptions: string[]
  onChange: (option: string[]) => void
}

const createSearchSelectParams = ({
  loans,
  selectedOptions,
  onChange,
}: CreateSearchSelectProps) => {
  const loansGroupedByCollection = groupBy(loans, ({ nft }) => nft.meta.collectionName)

  const searchSelectOptions = map(loansGroupedByCollection, (groupedLoans) => {
    const firstLoanInGroup = first(groupedLoans)
    const { collectionName = '', collectionImage = '' } = firstLoanInGroup?.nft.meta || {}
    const numberOfNFTs = groupedLoans.length

    return { collectionName, collectionImage, numberOfNFTs }
  })

  const searchSelectParams: SearchSelectProps<SearchSelectOption> = {
    options: searchSelectOptions,
    selectedOptions,
    onChange,
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: { key: 'numberOfNFTs' },
    },
    labels: ['Collection', 'Nfts'],
    className: styles.searchSelect,
  }

  return searchSelectParams
}
