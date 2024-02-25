import { useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { first, groupBy, map } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { SortOption } from '@banx/components/SortDropdown'

import { Loan } from '@banx/api/core'
import { PATHS } from '@banx/router'

import { DEFAULT_SORT_OPTION, EMPTY_MESSAGE, NOT_CONNECTED_MESSAGE } from '../constants'
import { useFilterLoans } from './useFilteredLoans'
import { SORT_OPTIONS, useSortedLoans } from './useSortedLoans'

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

  const {
    filteredLoansBySelectedCollection,
    filteredAllLoans,
    isTerminationFilterEnabled,
    toggleTerminationFilter,
    selectedCollections,
    setSelectedCollections,
    countOfTerminatingLoans,
  } = useFilterLoans(loans)

  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const sortedLoans = useSortedLoans(filteredLoansBySelectedCollection, sortOption.value)

  const searchSelectParams = createSearchSelectParams({
    loans: filteredAllLoans,
    selectedOptions: selectedCollections,
    onChange: setSelectedCollections,
  })

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
    loans: sortedLoans,
    loading: isLoading,
    countOfTerminatingLoans,

    isTerminationFilterEnabled,
    toggleTerminationFilter,

    showSummary,
    showEmptyList,
    emptyListParams,

    sortViewParams: {
      searchSelectParams,
      sortParams: {
        option: sortOption,
        onChange: setSortOption,
        className: styles.sortDropdown,
        options: SORT_OPTIONS,
      },
    },
  }
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
