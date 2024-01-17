import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { first, groupBy, map, sumBy } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { calculateClaimValue, isLoanAbleToClaim, useLenderLoans } from '@banx/pages/OffersPage'
import { formatDecimal, isLoanTerminating, isUnderWaterLoan } from '@banx/utils'

import { useSelectedLoans } from '../loansState'
import { useSortedLoans } from './useSortedLoans'

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
    underwaterLoans,
    underwaterLoansCount,
  } = useFilterLoans(loans)

  const loansToClaim = useMemo(() => loans.filter(isLoanAbleToClaim), [loans])

  const { sortedLoans, sortParams } = useSortedLoans(filteredLoans)

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
    underwaterLoans,

    underwaterLoansCount,

    isUnderwaterFilterActive,
    onToggleUnderwaterFilter,

    sortViewParams: {
      searchSelectParams,
      sortParams,
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
        format: (value: number) => createSolValueJSX(value, 1e9, '0◎', formatDecimal),
      },
    },
    onChange,
  }

  return searchSelectParams
}

const useFilterLoans = (loans: Loan[]) => {
  const { set: setSelection, clear: clearSelection } = useSelectedLoans()

  const [isUnderwaterFilterActive, setIsUnderwaterFilterActive] = useState(false)
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])

  const filteredLoansByCollection = useMemo(() => {
    if (selectedCollections.length) {
      return loans.filter(({ nft }) => selectedCollections.includes(nft.meta.collectionName))
    }
    return loans
  }, [loans, selectedCollections])

  const { underwaterLoans, nonTerminatingUnderwaterLoans } = useMemo(() => {
    const underwaterLoans = filteredLoansByCollection.filter(isUnderWaterLoan)
    const nonTerminatingUnderwaterLoans = underwaterLoans.filter((loan) => !isLoanTerminating(loan))

    return { underwaterLoans, nonTerminatingUnderwaterLoans }
  }, [filteredLoansByCollection])

  const onToggleUnderwaterFilter = () => {
    setIsUnderwaterFilterActive(!isUnderwaterFilterActive)
    isUnderwaterFilterActive ? clearSelection() : setSelection(nonTerminatingUnderwaterLoans)
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

    underwaterLoans: nonTerminatingUnderwaterLoans,
    underwaterLoansCount,

    isUnderwaterFilterActive,
    onToggleUnderwaterFilter,

    selectedCollections,
    setSelectedCollections,
  }
}
