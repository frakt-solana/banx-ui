import { useWallet } from '@solana/wallet-adapter-react'
import { first, groupBy, map } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { SearchSelectProps } from '@banx/components/SearchSelect'

import { core } from '@banx/api/nft'
import { ACTIVE_LOANS_TABLE_MESSAGES } from '@banx/pages/LoansPage/constants'
import { PATHS } from '@banx/router'
import { createPathWithTokenParam, useTokenType } from '@banx/store/nft'

import { useFilterLoans } from './useFilteredLoans'
import { useSortLoans } from './useSortLoans'

import styles from '../LoansActiveTable.module.less'

export interface SearchSelectOption {
  collectionName: string
  collectionImage: string
  numberOfNFTs: number
}

interface UseLoansActiveTableProps {
  loans: core.Loan[]
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
    terminatingLoansAmount,
    isRepaymentCallFilterEnabled,
    toggleRepaymentCallFilter,
    repaymentCallsAmount,
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
    message: ACTIVE_LOANS_TABLE_MESSAGES[tokenType][connected ? 'connected' : 'notConnected'],
    buttonProps: connected ? { text: 'Borrow', onClick: goToBorrowPage } : undefined,
  }

  return {
    loans: sortedLoans,
    loading: isLoading,

    terminatingLoansAmount,
    isTerminationFilterEnabled,
    toggleTerminationFilter,

    repaymentCallsAmount,
    isRepaymentCallFilterEnabled,
    toggleRepaymentCallFilter,

    showSummary,
    showEmptyList,
    emptyListParams,
    sortViewParams: { searchSelectParams, sortParams },
  }
}

interface CreateSearchSelectProps {
  loans: core.Loan[]
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
