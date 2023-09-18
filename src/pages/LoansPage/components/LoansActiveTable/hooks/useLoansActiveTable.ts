import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { first, groupBy, map } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { SortOption } from '@banx/components/SortDropdown'

import { useWalletLoans } from '@banx/pages/LoansPage/hooks'
import { PATHS } from '@banx/router'

import { DEFAULT_SORT_OPTION, EMPTY_MESSAGE, NOT_CONNECTED_MESSAGE } from '../constants'
import { useFilteredLoans } from './useFilteredLoans'
import { useSortedLoans } from './useSortedLoans'

import styles from '../LoansActiveTable.module.less'

export interface SearchSelectOption {
  collectionName: string
  collectionImage: string
  numberOfNFTs: number
}

export const useLoansActiveTable = () => {
  const { loans, isLoading } = useWalletLoans()
  const { connected } = useWallet()

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const filteredLoans = useFilteredLoans(loans, selectedOptions)
  const sortedLoans = useSortedLoans(filteredLoans, sortOption.value)

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

  const sortParams = {
    option: sortOption,
    onChange: setSortOption,
    className: styles.sortDropdown,
  }

  const showEmptyList = (!loans?.length && !isLoading) || !connected
  const showSummary = !!loans.length && !isLoading

  const emptyListParams = {
    message: connected ? EMPTY_MESSAGE : NOT_CONNECTED_MESSAGE,
    buttonText: connected ? 'Borrow' : '',
    path: connected ? PATHS.BORROW : '',
  }

  return {
    loans: sortedLoans,
    loading: isLoading,
    showEmptyList,
    showSummary,
    emptyListParams,
    sortViewParams: {
      searchSelectParams,
      sortParams,
    },
  }
}
