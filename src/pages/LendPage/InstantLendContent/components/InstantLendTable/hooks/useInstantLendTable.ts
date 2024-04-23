import { useMemo } from 'react'

import { filter, first, groupBy, includes, map } from 'lodash'

import { Loan } from '@banx/api/core'
import { createGlobalState } from '@banx/store/functions'

import { useAuctionsLoans } from '../../../hooks'
import { useSortedLoans } from './useSortedLoans'

import styles from '../InstantLendTable.module.less'

const useCollectionsStore = createGlobalState<string[]>([])

export const useInstantLendTable = () => {
  const { loans, isLoading } = useAuctionsLoans()

  const [selectedCollections, setSelectedCollections] = useCollectionsStore()

  const filteredLoans = useMemo(() => {
    if (selectedCollections.length) {
      return filter(loans, ({ nft }) => includes(selectedCollections, nft.meta.collectionName))
    }
    return loans
  }, [loans, selectedCollections])

  const { sortedLoans, sortParams } = useSortedLoans(filteredLoans)

  const searchSelectParams = createSearchSelectParams({
    options: loans,
    selectedOptions: selectedCollections,
    onChange: setSelectedCollections,
  })

  const showEmptyList = !loans?.length && !isLoading

  return {
    loans: sortedLoans,
    loading: isLoading,
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
