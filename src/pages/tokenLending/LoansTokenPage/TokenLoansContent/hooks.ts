import { useMemo, useState } from 'react'

import { map, orderBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { TokenLoan } from '@banx/api/tokens'
import { createGlobalState } from '@banx/store'

import { LoansPreview, buildLoansPreviewGroupedByMint } from '../helpers'

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

export enum SortField {
  APR = 'apr',
  DEBT = 'debt',
  LTV = 'ltv',
}

type SortValueGetter = (loan: LoansPreview) => number

const SORT_OPTIONS: SortOption<SortField>[] = [
  { label: 'APR', value: [SortField.APR, 'desc'] },
  { label: 'Debt', value: [SortField.DEBT, 'desc'] },
  { label: 'LTV', value: [SortField.LTV, 'desc'] },
]

const SORT_VALUE_MAP: Record<SortField, string | SortValueGetter> = {
  [SortField.APR]: (preview) => preview.weightedApr,
  [SortField.DEBT]: (preview) => preview.totalDebt,
  [SortField.LTV]: (preview) => preview.weightedLtv,
}

export const useSortedLoansPreviews = (loansPreviews: LoansPreview[]) => {
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
