import { useMemo, useState } from 'react'

import { filter, size } from 'lodash'

import { TokenLoan } from '@banx/api/tokens'
import { createGlobalState } from '@banx/store'
import {
  isTokenLoanFrozen,
  isTokenLoanListed,
  isTokenLoanSelling,
  isTokenLoanTerminating,
} from '@banx/utils'

const useCollectionsStore = createGlobalState<string[]>([])

type LoanPredicate = (loan: TokenLoan) => boolean

export const useFilterLoans = (loans: TokenLoan[]) => {
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
    const applyFilter = (sourceLoans: TokenLoan[]) => {
      const baseLoans = getBaseLoans(sourceLoans)
      const auctionLoans = filter(sourceLoans, isTokenLoanTerminating)
      const frozenLoans = filter(sourceLoans, isTokenLoanFrozen)

      const auctionFilterResult = isAuctionFilterEnabled ? auctionLoans : []
      const freezeFilterResult = isFreezeFilterEnabled ? frozenLoans : []

      //? Always include baseLoans, with conditional auction/freeze results
      return [...baseLoans, ...auctionFilterResult, ...freezeFilterResult]
    }

    return {
      filteredLoansBySelectedCollection: applyFilter(filteredLoansBySelectedCollections),
      filteredAllLoans: applyFilter(loans),
    }
  }, [filteredLoansBySelectedCollections, loans, isAuctionFilterEnabled, isFreezeFilterEnabled])

  const getLoanAmount = (predicate: LoanPredicate) =>
    size(filter(filteredLoansBySelectedCollections, predicate)) || null

  const auctionLoansAmount = getLoanAmount(isTokenLoanTerminating)
  const freezeLoansAmount = getLoanAmount(isTokenLoanFrozen)

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

//? Selects active loans: listed or selling, and not frozen.
const getBaseLoans = (loans: TokenLoan[]) => {
  const isListedOrSelling = (loan: TokenLoan) => isTokenLoanListed(loan) || isTokenLoanSelling(loan)
  const isNotFrozen = (loan: TokenLoan) => !isTokenLoanFrozen(loan)

  return loans.filter((loan) => isListedOrSelling(loan) && isNotFrozen(loan))
}
