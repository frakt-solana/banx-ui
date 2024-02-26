import { useWallet } from '@solana/wallet-adapter-react'
import { first, groupBy, map } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { SearchSelectProps } from '@banx/components/SearchSelect'

import { Loan } from '@banx/api/core'
import { PATHS } from '@banx/router'

import { EMPTY_MESSAGE, NOT_CONNECTED_MESSAGE } from '../constants'
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

  const {
    filteredLoansBySelectedCollection,
    filteredAllLoans,
    isTerminationFilterEnabled,
    toggleTerminationFilter,
    selectedCollections,
    setSelectedCollections,
    countOfTerminatingLoans,
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

    sortViewParams: { searchSelectParams, sortParams },
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
