import { useMemo, useState } from 'react'

import { orderBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { coreNew } from '@banx/api/nft'
import { calculateLendValue, calculateLenderApr, isLoanTerminating } from '@banx/utils'

enum SortField {
  DURATION = 'duration',
  RARITY = 'rarity',
  DEBT = 'repayValue',
  LTV = 'ltv',
  APR = 'apr',
  FREEZE = 'freeze',
}

type SortValueGetter = (loan: coreNew.Loan) => number

const SORT_OPTIONS: SortOption<SortField>[] = [
  { label: 'LTV', value: [SortField.LTV, 'asc'] },
  { label: 'Duration', value: [SortField.DURATION, 'desc'] },
  { label: 'Rarity', value: [SortField.RARITY, 'desc'] },
  { label: 'Debt', value: [SortField.DEBT, 'desc'] },
  { label: 'APR', value: [SortField.APR, 'desc'] },
  { label: 'Freeze', value: [SortField.FREEZE, 'desc'] },
]

const SORT_VALUE_MAP: Record<SortField, SortValueGetter> = {
  [SortField.DURATION]: (loan) => loan.fraktBond.refinanceAuctionStartedAt.toNumber(),
  [SortField.RARITY]: (loan) => loan.nft.rarity?.rank || 0,
  [SortField.DEBT]: (loan) => calculateLendValue(loan).toNumber(),
  [SortField.APR]: (loan) => {
    const isTerminatingStatus = isLoanTerminating(loan)
    return (
      isTerminatingStatus ? calculateLenderApr(loan) : loan.bondTradeTransaction.amountOfBonds
    ).toNumber()
  },
  [SortField.LTV]: (loan) => {
    const repayValue = calculateLendValue(loan).toNumber()
    const collectionFloor = loan.nft.collectionFloor.toNumber()

    return repayValue / collectionFloor
  },
  [SortField.FREEZE]: (loan) => loan.bondTradeTransaction.terminationFreeze.toNumber(),
}

export const useSortedLoans = (loans: coreNew.Loan[]) => {
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0])

  const sortedLoans = useMemo(() => {
    if (!sortOption) return loans

    const [field, order] = sortOption.value

    const sortValueGetter = SORT_VALUE_MAP[field]
    return orderBy(loans, sortValueGetter, order)
  }, [sortOption, loans])

  const onChangeSortOption = (option: SortOption<SortField>) => {
    setSortOption(option)
  }

  return {
    sortedLoans,
    sortParams: {
      option: sortOption,
      onChange: onChangeSortOption,
      options: SORT_OPTIONS,
    },
  }
}
