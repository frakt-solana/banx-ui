import { useMemo, useState } from 'react'

import { filter, size } from 'lodash'

import { core } from '@banx/api/nft'
import { createGlobalState } from '@banx/store/functions'
import { isFreezeLoan, isLoanListed } from '@banx/utils'

const useCollectionsStore = createGlobalState<string[]>([])

export const useFilterLoans = (loans: core.Loan[]) => {
  const [isAuctionFilterEnabled, setAuctionFilterState] = useState(true)
  const [isFreezeFilterEnabled, setFreezeFilterState] = useState(true)

  const [selectedCollections, setSelectedCollections] = useCollectionsStore()

  const toggleAuctionFilter = () => {
    setAuctionFilterState(!isAuctionFilterEnabled)
  }

  const toggleFreezeFilter = () => {
    setFreezeFilterState(!isFreezeFilterEnabled)
  }

  const filteredLoansBySelectedCollections = useMemo(() => {
    if (!selectedCollections.length) return loans

    return filter(loans, ({ nft }) => selectedCollections.includes(nft.meta.collectionName))
  }, [loans, selectedCollections])

  const { filteredLoansBySelectedCollection, filteredAllLoans } = useMemo(() => {
    const applyFilter = (loans: core.Loan[]) => {
      const auctionLoans = filter(loans, (loan) => !isLoanListed(loan))
      const listedLoans = filter(loans, (loan) => isLoanListed(loan))
      const listedLoansWithoutFreeze = filter(listedLoans, (loan) => !isFreezeLoan(loan))

      if (!isFreezeFilterEnabled && !isAuctionFilterEnabled) return listedLoansWithoutFreeze
      if (!isAuctionFilterEnabled) return listedLoans
      if (!isFreezeFilterEnabled) return [...listedLoansWithoutFreeze, ...auctionLoans]

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
