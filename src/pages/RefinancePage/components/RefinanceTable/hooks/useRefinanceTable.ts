import { useMemo, useState } from 'react'

import { filter, find, first, groupBy, map } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { Loan } from '@banx/api/core'
import { useAuctionsLoans } from '@banx/pages/RefinancePage/hooks'

import { DEFAULT_SORT_OPTION } from '../constants'
import { useFilteredLoans } from './useFilteredLoans'
import { useSortedLoans } from './useSortedLoans'

import styles from '../RefinanceTable.module.less'

export const useRefinanceTable = () => {
  const { loans, isLoading } = useAuctionsLoans()

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

  const showEmptyList = !loans?.length && !isLoading

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
    labels: ['Collection', 'Available'],
    className: styles.searchSelect,
  }

  const [selectedLoans, setSelectedLoans] = useState<Loan[]>([])

  const findSelectedLoan = (loanPubkey: string) =>
    find(selectedLoans, ({ publicKey }) => publicKey === loanPubkey)

  const onSelectLoan = (loan: Loan) => {
    const isLoanInCart = !!findSelectedLoan(loan.publicKey)
    if (isLoanInCart) {
      return setSelectedLoans((prev) =>
        filter(prev, ({ publicKey }) => publicKey !== loan.publicKey),
      )
    }
    return setSelectedLoans((prev) => [...prev, loan])
  }

  const onSelectAllLoans = () => setSelectedLoans([...loans])

  const onDeselectAllLoans = () => setSelectedLoans([])

  const deselectLoan = (loanPubkey: string) => {
    return setSelectedLoans((prev) => filter(prev, ({ publicKey }) => publicKey !== loanPubkey))
  }

  return {
    loans: sortedLoans,
    loading: isLoading,
    showEmptyList,
    selectedLoans,
    onSelectLoan,
    onSelectAllLoans,
    onDeselectAllLoans,
    findSelectedLoan,
    deselectLoan,
    sortViewParams: {
      searchSelectParams,
      sortParams: { option: sortOption, onChange: setSortOption },
    },
  }
}
