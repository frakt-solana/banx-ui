import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { first, groupBy, map } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { SearchSelectProps } from '@banx/components/SearchSelect'

import { Loan } from '@banx/api/core'
import { PATHS } from '@banx/router'

import { EMPTY_MESSAGE, NOT_CONNECTED_MESSAGE } from '../constants'
import { useFilteredLoans } from './useFilteredLoans'
import { useSortedLoans } from './useSortedLoans'

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

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const filteredLoans = useFilteredLoans(loans, selectedOptions)
  const { sortedLoans, sortParams } = useSortedLoans(filteredLoans)

  const searchSelectOptions = useMemo(() => {
    const loansGroupedByCollection = groupBy(loans, ({ nft }) => nft.meta.collectionName)

    return map(loansGroupedByCollection, (groupedLoan) => {
      const firstLoanInGroup = first(groupedLoan)
      const { collectionName = '', collectionImage = '' } = firstLoanInGroup?.nft.meta || {}
      const numberOfNFTs = groupedLoan.length

      return { collectionName, collectionImage, numberOfNFTs }
    })
  }, [loans])

  const searchSelectParams: SearchSelectProps<SearchSelectOption> = {
    onChange: setSelectedOptions,
    options: searchSelectOptions,
    selectedOptions,
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: { key: 'numberOfNFTs' },
    },
    labels: ['Collection', 'Nfts'],
    className: styles.searchSelect,
  }

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
    showEmptyList,
    showSummary,
    emptyListParams,
    sortViewParams: {
      searchSelectParams,
      sortParams: {
        ...sortParams,
        className: styles.sortDropdown,
      },
    },
  }
}
