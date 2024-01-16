import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { first, groupBy, map, sumBy } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import {
  calculateClaimValue,
  isLoanAbleToClaim,
  isLoanAbleToTerminate,
  useLenderLoans,
} from '@banx/pages/OffersPage'
import { formatDecimal, isUnderWaterLoan } from '@banx/utils'

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

  const { loansToClaim, loansToTerminate } = useMemo(() => {
    const loansToClaim = loans.filter(isLoanAbleToClaim)
    const loansToTerminate = loans.filter(isLoanAbleToTerminate)

    return { loansToClaim, loansToTerminate }
  }, [loans])

  const {
    filteredLoans,
    isUnderwaterFilterActive,
    onToggleUnderwaterFilter,
    selectedCollections,
    setSelectedCollections,
  } = useFilteredLoans(loans)

  const { sortedLoans, sortParams } = useSortedLoans(filteredLoans)

  const searchSelectParams = createSearchSelectParams({
    loans,
    selectedOptions: selectedCollections,
    onChange: setSelectedCollections,
  })

  const showEmptyList = (!loans.length && !loading) || !connected
  const emptyMessage = connected
    ? 'Your offers is waiting for a borrower'
    : 'Connect wallet to view your active offers'

  return {
    loansToClaim,
    loansToTerminate,

    loans: sortedLoans,
    hideLoans,
    updateOrAddLoan,
    loading,

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

const useFilteredLoans = (loans: Loan[]) => {
  const { set: setSelection, clear: clearSelection } = useSelectedLoans()

  const [selectedCollections, setSelectedCollections] = useState<string[]>([])

  const [isUnderwaterFilterActive, setIsUnderwaterFilterActive] = useState(false)

  const filteredLoansByCollection = useMemo(() => {
    if (selectedCollections.length) {
      return loans.filter(({ nft }) => selectedCollections.includes(nft.meta.collectionName))
    }
    return loans
  }, [loans, selectedCollections])

  const filteredUnderwaterLoans = filteredLoansByCollection.filter(isUnderWaterLoan)

  const onToggleUnderwaterFilter = () => {
    setIsUnderwaterFilterActive(!isUnderwaterFilterActive)

    if (isUnderwaterFilterActive) {
      clearSelection()
    } else {
      setSelection(filteredUnderwaterLoans)
    }
  }

  const filteredLoans = useMemo(() => {
    if (isUnderwaterFilterActive) return filteredUnderwaterLoans

    return filteredLoansByCollection
  }, [isUnderwaterFilterActive, filteredUnderwaterLoans, filteredLoansByCollection])

  return {
    filteredLoans,

    isUnderwaterFilterActive,
    onToggleUnderwaterFilter,

    selectedCollections,
    setSelectedCollections,
  }
}
