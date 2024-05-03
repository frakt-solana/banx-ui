import { useMemo, useState } from 'react'

import { filter, size } from 'lodash'

import { Loan } from '@banx/api/core'
import { createGlobalState } from '@banx/store/functions'
import { isFreezeLoan, isLoanListed } from '@banx/utils'

const useCollectionsStore = createGlobalState<string[]>([])

export const useFilterLoans = (loans: Loan[]) => {
  const [isAuctionFilterEnabled, setAuctionFilterState] = useState(false)
  const [isFreezeFilterEnabled, setFreezeFilterState] = useState(false)

  const [selectedCollections, setSelectedCollections] = useCollectionsStore()

  const toggleAuctionFilter = () => {
    setFreezeFilterState(false)
    setAuctionFilterState(!isAuctionFilterEnabled)
  }

  const toggleFreezeFilter = () => {
    setAuctionFilterState(false)
    setFreezeFilterState(!isFreezeFilterEnabled)
  }

  const filteredLoansBySelectedCollections = useMemo(() => {
    if (!selectedCollections.length) return loans

    return filter(loans, ({ nft }) => selectedCollections.includes(nft.meta.collectionName))
  }, [loans, selectedCollections])

  const { filteredLoansBySelectedCollection, filteredAllLoans } = useMemo(() => {
    const applyFilter = (loans: Loan[]) => {
      if (isAuctionFilterEnabled) return filter(loans, (loan) => !isLoanListed(loan))
      if (isFreezeFilterEnabled) return filter(loans, (loan) => isFreezeLoan(loan))
      return loans
    }

    return {
      filteredLoansBySelectedCollection: applyFilter(filteredLoansBySelectedCollections),
      filteredAllLoans: applyFilter(loans),
    }
  }, [filteredLoansBySelectedCollections, loans, isAuctionFilterEnabled, isFreezeFilterEnabled])

  const auctionLoansAmount = useMemo(
    () => size(filter(filteredLoansBySelectedCollections, (loan) => !isLoanListed(loan))) || null,
    [filteredLoansBySelectedCollections],
  )

  const freezeLoansAmount = useMemo(
    () => size(filter(filteredLoansBySelectedCollections, (loan) => isFreezeLoan(loan))) || null,
    [filteredLoansBySelectedCollections],
  )

  return {
    filteredLoansBySelectedCollection,
    filteredAllLoans,

    auctionLoansAmount,
    freezeLoansAmount,

    isAuctionFilterEnabled,
    toggleAuctionFilter,

    isFreezeFilterEnabled,
    toggleFreezeFilter,

    selectedCollections,
    setSelectedCollections,
  }
}
