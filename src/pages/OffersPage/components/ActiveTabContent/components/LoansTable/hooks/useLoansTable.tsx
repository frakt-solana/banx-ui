import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { first, groupBy, map, sumBy } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { SortOption } from '@banx/components/SortDropdown'
import { DisplayValue } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import {
  calculateClaimValue,
  isLoanAbleToClaim,
  isLoanAbleToTerminate,
  useLenderLoans,
} from '@banx/pages/OffersPage'
import { createGlobalState } from '@banx/store/functions'
import { isUnderWaterLoan } from '@banx/utils'

import { DEFAULT_SORT_OPTION, SORT_OPTIONS, useSortedLoans } from './useSortedLoans'

import styles from '../LoansTable.module.less'

type SearchSelectOption = {
  collectionName: string
  collectionImage: string
  claim: number
}

export const useLoansTable = () => {
  const { connected } = useWallet()

  const { loans, addMints: hideLoans, updateOrAddLoan, loading } = useLenderLoans()

  const {
    filteredLoans,
    isUnderwaterFilterActive,
    onToggleUnderwaterFilter,
    selectedCollections,
    setSelectedCollections,
    filteredAllLoans,
    underwaterLoansCount,
  } = useFilterLoans(loans)

  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const sortedLoans = useSortedLoans(filteredLoans, sortOption)

  const loansToClaim = useMemo(() => sortedLoans.filter(isLoanAbleToClaim), [sortedLoans])
  const loansToTerminate = useMemo(() => sortedLoans.filter(isLoanAbleToTerminate), [sortedLoans])

  const searchSelectParams = createSearchSelectParams({
    loans: filteredAllLoans,
    selectedOptions: selectedCollections,
    onChange: setSelectedCollections,
  })

  const showEmptyList = (!loans.length && !loading) || !connected
  const emptyMessage = connected
    ? 'Your offers is waiting for a borrower'
    : 'Connect wallet to view your active offers'

  return {
    loans: sortedLoans,
    hideLoans,
    updateOrAddLoan,
    loading,

    loansToClaim,
    loansToTerminate,

    underwaterLoansCount,

    isUnderwaterFilterActive,
    onToggleUnderwaterFilter,

    sortViewParams: {
      searchSelectParams,
      sortParams: {
        option: sortOption,
        onChange: setSortOption,
        options: SORT_OPTIONS,
      },
    },

    showEmptyList,
    emptyMessage,
  }
}

interface CreateSearchSelectProps {
  loans: Loan[]
  selectedOptions: string[]
  onChange: (option: string[]) => void
}

const createSearchSelectParams = ({
  loans,
  selectedOptions,
  onChange,
}: CreateSearchSelectProps) => {
  const loansGroupedByCollection = groupBy(loans, ({ nft }) => nft.meta.collectionName)

  const searchSelectOptions = map(loansGroupedByCollection, (groupedLoans) => {
    const firstLoanInGroup = first(groupedLoans)
    const { collectionName = '', collectionImage = '' } = firstLoanInGroup?.nft.meta || {}
    const claim = sumBy(groupedLoans, calculateClaimValue)

    return { collectionName, collectionImage, claim }
  })

  const searchSelectParams: SearchSelectProps<SearchSelectOption> = {
    options: searchSelectOptions,
    selectedOptions,
    className: styles.searchSelect,
    labels: ['Collection', 'Claim'],
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'claim',
        format: (value: number) => <DisplayValue value={value} />,
      },
    },
    onChange,
  }

  return searchSelectParams
}

const useCollectionsStore = createGlobalState<string[]>([])

const useFilterLoans = (loans: Loan[]) => {
  const [isUnderwaterFilterActive, setIsUnderwaterFilterActive] = useState(false)
  const [selectedCollections, setSelectedCollections] = useCollectionsStore()

  const filteredLoansByCollection = useMemo(() => {
    if (selectedCollections.length) {
      return loans.filter(({ nft }) => selectedCollections.includes(nft.meta.collectionName))
    }
    return loans
  }, [loans, selectedCollections])

  const underwaterLoans = useMemo(
    () => filteredLoansByCollection.filter(isUnderWaterLoan),
    [filteredLoansByCollection],
  )

  const onToggleUnderwaterFilter = () => {
    setIsUnderwaterFilterActive(!isUnderwaterFilterActive)
  }

  const { filteredLoans, filteredAllLoans } = useMemo(() => {
    const applyFilter = (loans: Loan[]) => (isUnderwaterFilterActive ? underwaterLoans : loans)

    return {
      filteredLoans: applyFilter(filteredLoansByCollection),
      filteredAllLoans: applyFilter(loans),
    }
  }, [isUnderwaterFilterActive, underwaterLoans, filteredLoansByCollection, loans])

  const underwaterLoansCount = underwaterLoans.length > 0 ? underwaterLoans.length : null

  return {
    filteredLoans,
    filteredAllLoans,

    underwaterLoansCount,

    isUnderwaterFilterActive,
    onToggleUnderwaterFilter,

    selectedCollections,
    setSelectedCollections,
  }
}
