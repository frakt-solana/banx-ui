import { useWallet } from '@solana/wallet-adapter-react'
import { first, groupBy, map } from 'lodash'

import { core } from '@banx/api/tokens'

import { useFilterLoans } from './useFilterLoans'
import { useSortedLoans } from './useSortedLoans'

import styles from '../LoansTokenActiveTable.module.less'

export const useLoansTokenActiveTable = (props: {
  loans: core.TokenLoan[]
  isLoading: boolean
}) => {
  const { loans, isLoading } = props

  const { connected } = useWallet()

  const {
    filteredLoansBySelectedCollection,
    filteredAllLoans,
    isTerminationFilterEnabled,
    toggleTerminationFilter,
    selectedCollections,
    setSelectedCollections,
    terminatingLoansAmount,
    isRepaymentCallFilterEnabled,
    toggleRepaymentCallFilter,
    repaymentCallsAmount,
  } = useFilterLoans(loans)

  const searchSelectParams = createSearchSelectParams({
    loans: filteredAllLoans,
    selectedOptions: selectedCollections,
    onChange: setSelectedCollections,
  })

  const { sortedLoans, sortParams } = useSortedLoans(filteredLoansBySelectedCollection)

  const showEmptyList = (!loans?.length && !isLoading) || !connected
  const showSummary = !!loans.length && !isLoading

  return {
    loans: sortedLoans,
    loading: isLoading,

    terminatingLoansAmount,
    repaymentCallsAmount,
    isTerminationFilterEnabled,
    isRepaymentCallFilterEnabled,
    toggleTerminationFilter,
    toggleRepaymentCallFilter,

    showSummary,
    showEmptyList,
    sortViewParams: { searchSelectParams, sortParams },
  }
}

interface CreateSearchSelectProps {
  loans: core.TokenLoan[]
  selectedOptions: string[]
  onChange: (option: string[]) => void
}

const createSearchSelectParams = ({
  loans,
  selectedOptions,
  onChange,
}: CreateSearchSelectProps) => {
  const loansGroupedByCollection = groupBy(loans, (loan) => loan.collateral.ticker)

  const searchSelectOptions = map(loansGroupedByCollection, (groupedLoans) => {
    const firstLoanInGroup = first(groupedLoans)
    const { ticker = '', imageUrl = '' } = firstLoanInGroup?.collateral || {}
    const numberOfLoans = groupedLoans.length

    return { ticker, imageUrl, numberOfLoans }
  })

  const searchSelectParams = {
    labels: ['Market', 'Loans'],
    options: searchSelectOptions,
    selectedOptions,
    onChange,
    optionKeys: {
      labelKey: 'ticker',
      valueKey: 'ticker',
      imageKey: 'imageUrl',
      secondLabel: { key: 'numberOfLoans' },
    },
    className: styles.searchSelect,
  }

  return searchSelectParams
}
