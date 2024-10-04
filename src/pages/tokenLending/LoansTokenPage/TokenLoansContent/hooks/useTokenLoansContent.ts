import { useMemo, useState } from 'react'

import { map, orderBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { TokenLoan } from '@banx/api/tokens'
import { createGlobalState } from '@banx/store'

import { SORT_OPTIONS, SORT_VALUE_MAP } from '../constants'
import { buildLoansPreviewGroupedByMint } from '../helpers'
import { LoansPreview, SortField } from '../types'

const useCollateralsStore = createGlobalState<string[]>([])

export const useTokenLoansContent = (loans: TokenLoan[]) => {
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

  return {
    loansPreviews: sortedLoansPreviews,

    expandedCollateralMint,
    handleCardToggle,

    searchSelectParams,
    sortParams,
  }
}

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
