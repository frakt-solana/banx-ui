import { first, groupBy, map } from 'lodash'

import { Loan } from '@banx/api/core'

import { useAuctionsLoans } from '../../hooks'
import { useFilterLoans } from './useFilterLoans'
import { useSortedLoans } from './useSortedLoans'

import styles from '../InstantLendTable.module.less'

export const useInstantLendTable = () => {
  const { loans, isLoading } = useAuctionsLoans()

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

  const { sortedLoans, sortParams } = useSortedLoans(filteredLoansBySelectedCollection)

  const searchSelectParams = createSearchSelectParams({
    options: filteredAllLoans,
    selectedOptions: selectedCollections,
    onChange: setSelectedCollections,
  })

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

type CreateSearchSelectProps = {
  options: Loan[]
  selectedOptions: string[]
  onChange: (option: string[]) => void
}

const createSearchSelectParams = ({
  options,
  selectedOptions,
  onChange,
}: CreateSearchSelectProps) => {
  const loansGroupedByCollection = groupBy(options, ({ nft }) => nft.meta.collectionName)

  const searchSelectOptions = map(loansGroupedByCollection, (groupedLoans) => {
    const firstLoanInGroup = first(groupedLoans)
    const { collectionName = '', collectionImage = '' } = firstLoanInGroup?.nft.meta || {}
    const numberOfNFTs = groupedLoans.length

    return { collectionName, collectionImage, numberOfNFTs }
  })

  const searchSelectParams = {
    options: searchSelectOptions,
    selectedOptions,
    onChange,
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: { key: 'numberOfNFTs' },
    },
    labels: ['Collection', 'Available'],
    className: styles.searchSelect,
  }

  return searchSelectParams
}
