import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { first, groupBy, map, sumBy } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { SortOption } from '@banx/components/SortDropdown'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { PATHS } from '@banx/router'

import { DEFAULT_SORT_OPTION } from '../../LoansActiveTable/constants'
import { EMPTY_MESSAGE, NOT_CONNECTED_MESSAGE } from '../constants'
import { useBorrowerActivity } from './useBorrowerActivity'

import styles from '../LoansHistoryTable.module.less'

interface SearchSelectOption {
  collectionName: string
  collectionImage: string
  borrowed: number
}

export const useHistoryLoansTable = () => {
  const { loans, isLoading } = useBorrowerActivity()
  const { connected } = useWallet()

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const searchSelectOptions = useMemo(() => {
    const loansGroupedByCollection = groupBy(loans, (loans) => loans.nft.meta.collectionName)

    return map(loansGroupedByCollection, (groupedLoans) => {
      const firstLoanInGroup = first(groupedLoans)
      const { collectionName = '', collectionImage = '' } = firstLoanInGroup?.nft.meta || {}
      const borrowed = sumBy(groupedLoans, (nft) => nft.borrowed)

      return { collectionName, collectionImage, borrowed }
    })
  }, [loans])

  const searchSelectParams: SearchSelectProps<SearchSelectOption> = {
    options: searchSelectOptions,
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'borrowed',
        format: (value: number) => createSolValueJSX(value, 1e9),
      },
    },
    selectedOptions,
    labels: ['Collection', 'Borrowed'],
    onChange: setSelectedOptions,
    className: styles.searchSelect,
  }

  const sortParams = {
    option: sortOption,
    onChange: setSortOption,
    className: styles.sortDropdown,
  }

  const showEmptyList = (!loans?.length && !isLoading) || !connected
  const showSummary = loans.length && !isLoading

  const emptyListParams = {
    message: connected ? EMPTY_MESSAGE : NOT_CONNECTED_MESSAGE,
    buttonText: connected ? 'Borrow $SOL' : '',
    path: connected ? PATHS.BORROW : '',
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
  }
}
