import { useMemo, useState } from 'react'

import { first, groupBy, map } from 'lodash'
import { create } from 'zustand'

import { SortOption } from '@banx/components/SortDropdown'

import { Loan } from '@banx/api/core'
import { useAuctionsLoans } from '@banx/pages/RefinancePage/hooks'
import { createCollectionsStore } from '@banx/store/functions'

import { DEFAULT_SORT_OPTION } from '../constants'
import { useFilteredLoans } from './useFilteredLoans'
import { useSortedLoans } from './useSortedLoans'

import styles from '../RefinanceTable.module.less'

const useCollectionsStore = createCollectionsStore()

export const useRefinanceTable = () => {
  const { loans, isLoading } = useAuctionsLoans()

  const { selectedCollections, setSelectedCollections } = useCollectionsStore()

  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const filteredLoans = useFilteredLoans(loans, selectedCollections)
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
    onChange: setSelectedCollections,
    options: searchSelectOptions,
    selectedOptions: selectedCollections,
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: { key: 'numberOfNFTs' },
    },
    labels: ['Collection', 'Available'],
    className: styles.searchSelect,
  }

  return {
    loans: sortedLoans,
    loading: isLoading,
    showEmptyList,
    sortViewParams: {
      searchSelectParams,
      sortParams: { option: sortOption, onChange: setSortOption },
    },
  }
}

type LoansState = {
  selectedLoans: Loan[]
  findSelectedLoan: (loanPubkey: string) => Loan | undefined
  onSelectLoan: (loan: Loan) => void
  onSelectLoans: (loans: Loan[]) => void
  onDeselectAllLoans: () => void
  deselectLoan: (loanPubkey: string) => void
}

export const useLoansState = create<LoansState>((set, get) => ({
  selectedLoans: [],
  findSelectedLoan: (loanPubkey) =>
    get().selectedLoans.find(({ publicKey }) => publicKey === loanPubkey),
  onSelectLoan: (loan) =>
    set((state) => {
      const isLoanInCart = !!state.findSelectedLoan(loan.publicKey)
      if (isLoanInCart) {
        return {
          selectedLoans: state.selectedLoans.filter(
            ({ publicKey }) => publicKey !== loan.publicKey,
          ),
        }
      }
      return { selectedLoans: [...state.selectedLoans, loan] }
    }),
  onSelectLoans: (loans) => set({ selectedLoans: [...loans] }),
  onDeselectAllLoans: () => set({ selectedLoans: [] }),
  deselectLoan: (loanPubkey) =>
    set((state) => ({
      selectedLoans: state.selectedLoans.filter(({ publicKey }) => publicKey !== loanPubkey),
    })),
}))
