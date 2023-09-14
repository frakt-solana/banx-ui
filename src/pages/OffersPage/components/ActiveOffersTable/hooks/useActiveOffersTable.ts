import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { first, groupBy, map, sumBy } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { SortOption } from '@banx/components/SortDropdown'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { PATHS } from '@banx/router'

import { DEFAULT_SORT_OPTION, EMPTY_MESSAGE, NOT_CONNECTED_MESSAGE } from '../constants'
import { useLenderLoansAndOffers } from './useLenderLoansAndOffers'

import styles from '../ActiveOffersTable.module.less'

interface SearchSelectOption {
  collectionName: string
  collectionImage: string
  taken: number
}

export const useActiveOffersTable = () => {
  const { loans, loading } = useLenderLoansAndOffers()
  const { connected } = useWallet()

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const searchSelectOptions = useMemo(() => {
    const loansGroupedByCollection = groupBy(loans, ({ nft }) => nft.meta.collectionName)

    return map(loansGroupedByCollection, (groupedLoan) => {
      const firstLoanInGroup = first(groupedLoan)
      const { collectionName = '', collectionImage = '' } = firstLoanInGroup?.nft.meta || {}
      const taken = sumBy(groupedLoan, (nft) => nft.bondTradeTransaction.solAmount)

      return { collectionName, collectionImage, taken }
    })
  }, [loans])

  const searchSelectParams: SearchSelectProps<SearchSelectOption> = {
    options: searchSelectOptions,
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'taken',
        format: (value: number) => createSolValueJSX(value, 1e9),
      },
    },
    selectedOptions,
    labels: ['Collection', 'Taken'],
    onChange: setSelectedOptions,
    className: styles.searchSelect,
  }

  const sortParams = {
    option: sortOption,
    onChange: setSortOption,
  }

  const showEmptyList = (!loans?.length && !loading) || !connected

  const emptyListParams = {
    message: connected ? EMPTY_MESSAGE : NOT_CONNECTED_MESSAGE,
    buttonText: connected ? 'Lend $SOL' : '',
    path: connected ? PATHS.LEND : '',
  }

  return {
    loans,
    loading,
    showEmptyList,
    emptyListParams,
    sortViewParams: {
      searchSelectParams,
      sortParams,
    },
  }
}
