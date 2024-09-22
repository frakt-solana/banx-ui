import { useWallet } from '@solana/wallet-adapter-react'
import { first, groupBy, map } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { core } from '@banx/api/tokens'
import { PATHS } from '@banx/router'
import { buildUrlWithModeAndToken } from '@banx/store'
import { AssetMode } from '@banx/store/common'
import { useNftTokenType } from '@banx/store/nft'
import { getTokenTicker } from '@banx/utils'

import { useFilterLoans } from './useFilterLoans'
import { useSortedLoans } from './useSortedLoans'

import styles from '../LoansTokenActiveTable.module.less'

export const useLoansTokenActiveTable = (props: {
  loans: core.TokenLoan[]
  isLoading: boolean
}) => {
  const { loans, isLoading } = props

  const { connected } = useWallet()
  const navigate = useNavigate()

  const { tokenType } = useNftTokenType()

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

  const goToBorrowPage = () => {
    navigate(buildUrlWithModeAndToken(PATHS.BORROW_TOKEN, AssetMode.Token, tokenType))
  }

  const tokenTicker = getTokenTicker(tokenType)

  const emptyListParams = {
    message: connected
      ? createConnectedMessage(tokenTicker)
      : createNotConnectedMessage(tokenTicker),
    buttonProps: connected ? { text: 'Borrow', onClick: goToBorrowPage } : undefined,
  }

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
    emptyListParams,
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
    const { ticker = '', logoUrl = '' } = firstLoanInGroup?.collateral || {}
    const numberOfLoans = groupedLoans.length

    return { ticker, logoUrl, numberOfLoans }
  })

  const searchSelectParams = {
    labels: ['Market', 'Loans'],
    options: searchSelectOptions,
    selectedOptions,
    onChange,
    optionKeys: {
      labelKey: 'ticker',
      valueKey: 'ticker',
      imageKey: 'logoUrl',
      secondLabel: { key: 'numberOfLoans' },
    },
    className: styles.searchSelect,
  }

  return searchSelectParams
}

const createNotConnectedMessage = (ticker: string) =>
  `Connect wallet to borrow ${ticker} against your collaterals`

const createConnectedMessage = (ticker: string) => `Borrow ${ticker} against your collaterals`
