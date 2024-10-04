import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { map, orderBy } from 'lodash'
import { useNavigate } from 'react-router-dom'

import { SortOption } from '@banx/components/SortDropdown'

import { TokenLoan } from '@banx/api/tokens'
import { PATHS } from '@banx/router'
import { buildUrlWithModeAndToken, createGlobalState } from '@banx/store'
import { AssetMode, useTokenType } from '@banx/store/common'
import { getTokenTicker } from '@banx/utils'

import { SORT_OPTIONS, SORT_VALUE_MAP } from '../constants'
import { buildLoansPreviewGroupedByMint } from '../helpers'
import { LoansPreview, SortField } from '../types'

const useCollateralsStore = createGlobalState<string[]>([])

export const useTokenLoansContent = (loans: TokenLoan[]) => {
  const { connected } = useWallet()
  const { tokenType } = useTokenType()
  const navigate = useNavigate()

  const loansPreviews = useMemo(() => buildLoansPreviewGroupedByMint(loans), [loans])

  const [selectedCollaterals, setSelectedCollaterals] = useCollateralsStore()

  const searchSelectParams = createSearchSelectParams({
    options: loansPreviews,
    selectedOptions: selectedCollaterals,
    onChange: setSelectedCollaterals,
  })

  const [expandedCollateralMint, setExpandedCollateralMint] = useState('')

  const handleCardToggle = (mint: string) => {
    setExpandedCollateralMint((prevMint) => (prevMint === mint ? '' : mint))
  }

  const { sortedLoansPreviews, sortParams } = useSortedLoansPreviews(loansPreviews)

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
      valueKey: 'collateralMint',
      imageKey: 'collateralLogoUrl',
      secondLabel: {
        key: 'loansAmount',
      },
    },
  }

  return searchSelectParams
}

const useSortedLoansPreviews = (loansPreviews: LoansPreview[]) => {
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0])

  const sortedLoansPreviews = useMemo(() => {
    if (!sortOption) return loansPreviews

    const [field, order] = sortOption.value

    const sortValueGetter = SORT_VALUE_MAP[field]

    return orderBy(loansPreviews, sortValueGetter, order)
  }, [sortOption, loansPreviews])

  const onChangeSortOption = (option: SortOption<SortField>) => {
    setSortOption(option)
  }

  return {
    sortedLoansPreviews,
    sortParams: {
      option: sortOption,
      onChange: onChangeSortOption,
      options: SORT_OPTIONS,
    },
  }
}
