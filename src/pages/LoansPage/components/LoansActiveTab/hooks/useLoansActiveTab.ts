import { useMemo, useState } from 'react'

import { first, groupBy, map } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { DEFAULT_SORT_OPTION } from '@banx/pages/LoansPage/constants'
import { useWalletLoans } from '@banx/pages/LoansPage/hooks'

import { useFilteredLoans } from './useFilteredLoans'
import { useSortedLoans } from './useSortedLoans'

import styles from '../LoansActiveTable.module.less'

export type SearchSelectOption = {
  collectionName: string
  collectionImage: string
}

export const useLoansActiveTab = () => {
  const { loans, isLoading } = useWalletLoans()

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const filteredLoans = useFilteredLoans(loans, selectedOptions)
  const sortedLoans = useSortedLoans(filteredLoans, sortOption.value)

  const searchSelectOptions = useMemo(() => {
    const loansGroupedByCollection = groupBy(loans, (loan) => loan.nft.meta.collectionName)

    return map(loansGroupedByCollection, (groupedLoan) => {
      const firstLoanInGroup = first(groupedLoan)
      const { collectionName = '', collectionImage = '' } = firstLoanInGroup?.nft.meta || {}
      const numberOfNFTs = groupedLoan.length

      return {
        collectionName,
        collectionImage,
        numberOfNFTs,
      }
    })
  }, [loans])

  const searchSelectParams = {
    onChange: setSelectedOptions,
    options: searchSelectOptions,
    selectedOptions,
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: { key: 'numberOfNFTs' },
    },
    labels: ['Collections', 'Nfts'],
    className: styles.searchSelect,
  }

  return {
    loans: sortedLoans,
    loading: isLoading,
    sortViewParams: {
      searchSelectParams,
      sortParams: { option: sortOption, onChange: setSortOption },
    },
  }
}
