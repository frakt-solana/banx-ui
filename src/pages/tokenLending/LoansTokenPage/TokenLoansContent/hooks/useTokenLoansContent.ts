import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { map } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { TokenLoan } from '@banx/api/tokens'
import { PATHS } from '@banx/router'
import { buildUrlWithModeAndToken } from '@banx/store'
import { AssetMode, useTokenType } from '@banx/store/common'
import { getTokenTicker } from '@banx/utils'

import { buildLoansPreviewGroupedByMint } from '../helpers'
import { LoansPreview } from '../types'
import { useFilterTokenLoansPreviews } from './useFilterTokenLoansPreviews'
import { useSortTokenLoansPreviews } from './useSortTokenLoansPreviews'

export const useTokenLoansContent = (loans: TokenLoan[]) => {
  const { connected } = useWallet()
  const { tokenType } = useTokenType()
  const navigate = useNavigate()

  const loansPreviews = useMemo(() => buildLoansPreviewGroupedByMint(loans), [loans])

  const [expandedCollateralMint, setExpandedCollateralMint] = useState('')

  const handleCardToggle = (mint: string) => {
    setExpandedCollateralMint((prevMint) => (prevMint === mint ? '' : mint))
  }

  const {
    filteredLoansPreviews,
    filteredLoansPreviewsBySelectedCollateral,
    terminatingLoansAmount,
    repaymentCallsAmount,
    isTerminationFilterEnabled,
    toggleTerminationFilter,
    isRepaymentCallFilterEnabled,
    toggleRepaymentCallFilter,
    selectedCollateralTicker,
    setSelectedCollateralTicker,
  } = useFilterTokenLoansPreviews(loansPreviews)

  const { sortedLoansPreviews, sortParams } = useSortTokenLoansPreviews(
    filteredLoansPreviewsBySelectedCollateral,
  )

  const searchSelectParams = createSearchSelectParams({
    options: filteredLoansPreviews,
    selectedOptions: selectedCollateralTicker,
    onChange: setSelectedCollateralTicker,
  })

  const goToBorrowPage = () => {
    navigate(buildUrlWithModeAndToken(PATHS.BORROW, AssetMode.Token, tokenType))
  }

  const emptyListParams = {
    message: connected
      ? createConnectedMessage(getTokenTicker(tokenType))
      : createNotConnectedMessage(getTokenTicker(tokenType)),
    buttonProps: connected ? { text: 'Borrow', onClick: goToBorrowPage } : undefined,
  }

  return {
    loansPreviews: sortedLoansPreviews,

    terminatingLoansAmount,
    repaymentCallsAmount,
    isTerminationFilterEnabled,
    toggleTerminationFilter,
    isRepaymentCallFilterEnabled,
    toggleRepaymentCallFilter,

    expandedCollateralMint,
    handleCardToggle,

    emptyListParams,

    searchSelectParams,
    sortParams,
  }
}

const createNotConnectedMessage = (ticker: string) =>
  `Connect wallet to borrow ${ticker} against your collaterals`

const createConnectedMessage = (ticker: string) => `Borrow ${ticker} against your collaterals`

interface CreateSearchSelectProps {
  options: LoansPreview[]
  selectedOptions: string[]
  onChange: (option: string[]) => void
}

const createSearchSelectParams = ({
  options,
  selectedOptions,
  onChange,
}: CreateSearchSelectProps) => {
  const searchSelectOptions = map(options, (option) => {
    const { collareralTicker = '', collateralLogoUrl = '' } = option || {}
    const loansAmount = option.loans.length

    return { collareralTicker, collateralLogoUrl, loansAmount }
  })

  const searchSelectParams = {
    options: searchSelectOptions,
    selectedOptions,
    onChange,
    labels: ['Collateral', 'Loans'],
    optionKeys: {
      labelKey: 'collareralTicker',
      valueKey: 'collareralTicker',
      imageKey: 'collateralLogoUrl',
      secondLabel: {
        key: 'loansAmount',
      },
    },
  }

  return searchSelectParams
}
