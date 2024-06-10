import { useMemo, useState } from 'react'

import { chain, orderBy } from 'lodash'

import { SortOption, SortOrder } from '@banx/components/SortDropdown'

import { core } from '@banx/api/tokens'
import {
  isTokenLoanLiquidated,
  isTokenLoanRepaymentCallActive,
  isTokenLoanTerminating,
} from '@banx/utils'

import styles from '../LoansTokenActiveTable.module.less'

enum SortField {
  APR = 'apr',
  STATUS = 'status',
  DURATION = 'duration',
}

type SortValueGetter = (loan: core.TokenLoan) => number

const SORT_OPTIONS: SortOption<SortField>[] = [
  { label: 'Status', value: [SortField.STATUS, 'desc'] },
  { label: 'APR', value: [SortField.APR, 'desc'] },
  { label: 'Duration', value: [SortField.DURATION, 'desc'] },
]

const SORT_VALUE_MAP: Record<SortField, string | SortValueGetter> = {
  [SortField.APR]: (loan) => loan.bondTradeTransaction.amountOfBonds,
  [SortField.DURATION]: (loan) => loan.fraktBond.activatedAt * -1,
  [SortField.STATUS]: '',
}

const sortStatusLoans = (loans: core.TokenLoan[], order: SortOrder) => {
  const terminatingLoans = chain(loans)
    .filter(isTokenLoanTerminating)
    .sortBy((loan) => loan.fraktBond.refinanceAuctionStartedAt)
    .reverse()
    .value()

  const repaymentCallLoans = chain(loans)
    .filter(isTokenLoanRepaymentCallActive)
    .sortBy((loan) => loan.bondTradeTransaction.repaymentCallAmount)
    .reverse()
    .value()

  const otherLoans = chain(loans)
    .filter(
      (loan) =>
        !isTokenLoanTerminating(loan) &&
        !isTokenLoanLiquidated(loan) &&
        !isTokenLoanRepaymentCallActive(loan),
    )
    .sortBy((loan) => loan.fraktBond.activatedAt)
    .reverse()
    .value()

  const combinedLoans = [...otherLoans, ...repaymentCallLoans, ...terminatingLoans]

  return order === 'asc' ? combinedLoans : combinedLoans.reverse()
}

export const useSortedLoans = (loans: core.TokenLoan[]) => {
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0])

  const sortedLoans = useMemo(() => {
    if (!sortOption) return loans

    const [field, order] = sortOption.value

    const sortValueGetter = SORT_VALUE_MAP[field]

    return field === SortField.STATUS
      ? sortStatusLoans(loans, order)
      : orderBy(loans, sortValueGetter, order)
  }, [sortOption, loans])

  const onChangeSortOption = (option: SortOption<SortField>) => {
    setSortOption(option)
  }

  return {
    sortedLoans,
    sortParams: {
      option: sortOption,
      onChange: onChangeSortOption,
      className: styles.sortDropdown,
      options: SORT_OPTIONS,
    },
  }
}
