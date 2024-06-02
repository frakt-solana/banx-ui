import { useMemo, useState } from 'react'

import { filter, size } from 'lodash'

import { core } from '@banx/api/tokens'
import { createGlobalState } from '@banx/store'
import { isTokenLoanFrozen, isTokenLoanListed } from '@banx/utils'

const useCollectionsStore = createGlobalState<string[]>([])

export const useFilterLoans = (loans: core.TokenLoan[]) => {
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

    return filter(loans, ({ collateral }) => selectedCollections.includes(collateral.ticker))
  }, [loans, selectedCollections])

  const { filteredLoansBySelectedCollection, filteredAllLoans } = useMemo(() => {
    const applyFilter = (loans: core.TokenLoan[]) => {
      const auctionLoans = filter(loans, (loan) => !isTokenLoanListed(loan))
      const listedLoans = filter(loans, (loan) => isTokenLoanListed(loan))
      const listedLoansWithoutFreeze = filter(listedLoans, (loan) => !isTokenLoanFrozen(loan))

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
    () =>
      size(filter(filteredLoansBySelectedCollections, (loan) => !isTokenLoanListed(loan))) || null,
    [filteredLoansBySelectedCollections],
  )

  const freezeLoansAmount = useMemo(
    () =>
      size(filter(filteredLoansBySelectedCollections, (loan) => isTokenLoanFrozen(loan))) || null,
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
