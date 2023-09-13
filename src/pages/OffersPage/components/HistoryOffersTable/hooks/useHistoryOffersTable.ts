import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { first, groupBy, map, sumBy } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { SortOption } from '@banx/components/SortDropdown'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { PATHS } from '@banx/router'

import { DEFAULT_SORT_OPTION, EMPTY_MESSAGE, NOT_CONNECTED_MESSAGE } from '../constants'
import { useLenderActivity } from './useLenderActivity'

import styles from '../HistoryOffersTable.module.less'

interface SearchSelectOption {
  collectionName: string
  collectionImage: string
  received: number
}

export const useHistoryOffersTable = () => {
  const { loans, isLoading } = useLenderActivity()
  const { connected } = useWallet()

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const searchSelectOptions = useMemo(() => {
    const loansGroupedByCollection = groupBy(loans, ({ nft }) => nft.meta.collectionName)

    return map(loansGroupedByCollection, (groupedLoan) => {
      const firstLoanInGroup = first(groupedLoan)
      const { collectionName = '', collectionImage = '' } = firstLoanInGroup?.nft.meta || {}
      const received = sumBy(groupedLoan, (nft) => nft.received)

      return { collectionName, collectionImage, received }
    })
  }, [loans])

  const searchSelectParams: SearchSelectProps<SearchSelectOption> = {
    options: searchSelectOptions,
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'received',
        format: (value: number) => createSolValueJSX(value, 1e9),
      },
    },
    selectedOptions,
    labels: ['Collection', 'Received'],
    onChange: setSelectedOptions,
    className: styles.searchSelect,
  }

  const sortParams = {
    option: sortOption,
    onChange: setSortOption,
  }

  const showEmptyList = (!loans?.length && !isLoading) || !connected

  const emptyListParams = {
    message: connected ? EMPTY_MESSAGE : NOT_CONNECTED_MESSAGE,
    buttonText: connected ? 'Lend $SOL' : '',
    path: connected ? PATHS.LEND : '',
  }

  return {
    loans,
    loading: isLoading,
    showEmptyList,
    emptyListParams,
    sortViewParams: {
      searchSelectParams,
      sortParams,
    },
  }
}
