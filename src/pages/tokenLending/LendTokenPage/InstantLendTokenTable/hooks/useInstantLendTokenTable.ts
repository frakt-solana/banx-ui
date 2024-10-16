import { first, groupBy, map } from 'lodash'

import { core } from '@banx/api/tokens'

import { useAllTokenLoanAuctionsAndListings } from './useAllTokenLoanAuctionsAndListings'
import { useFilterLoans } from './useFilterLoans'
import { useSortedLoans } from './useSortedLoans'

import styles from '../InstantLendTokenTable.module.less'

export const useInstantLendTokenTable = () => {
  const { loans, isLoading } = useAllTokenLoanAuctionsAndListings()

  const {
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
  } = useFilterLoans(loans)

  const searchSelectParams = createSearchSelectParams({
    options: filteredAllLoans,
    selectedOptions: selectedCollections,
    onChange: setSelectedCollections,
  })

  const { sortedLoans, sortParams } = useSortedLoans(filteredLoansBySelectedCollection)

  const showEmptyList = !loans?.length && !isLoading

  return {
    loans: sortedLoans,
    loading: isLoading,
    auctionLoansAmount,
    freezeLoansAmount,
    isAuctionFilterEnabled,
    toggleAuctionFilter,
    isFreezeFilterEnabled,
    toggleFreezeFilter,
    showEmptyList,
    sortViewParams: {
      searchSelectParams,
      sortParams,
    },
  }
}

interface CreateSearchSelectProps {
  options: core.TokenLoan[]
  selectedOptions: string[]
  onChange: (option: string[]) => void
}

const createSearchSelectParams = ({
  options,
  selectedOptions,
  onChange,
}: CreateSearchSelectProps) => {
  const loansGroupedByCollection = groupBy(options, (loan) => loan.collateral.ticker)

  const searchSelectOptions = map(loansGroupedByCollection, (groupedLoans) => {
    const firstLoanInGroup = first(groupedLoans)
    const { ticker = '', logoUrl = '' } = firstLoanInGroup?.collateral || {}
    const numberOfLoans = groupedLoans.length

    return { ticker, logoUrl, numberOfLoans }
  })

  const searchSelectParams = {
    options: searchSelectOptions,
    selectedOptions,
    onChange,
    labels: ['Collateral', 'Available'],
    optionKeys: {
      labelKey: 'ticker',
      valueKey: 'ticker',
      imageKey: 'logoUrl',
      secondLabel: { key: 'numberOfLoans' },
    },
    className: styles.searchSelect,
    disabled: !options.length,
  }

  return searchSelectParams
}
