import { useMemo, useState } from 'react'

import { chain, orderBy } from 'lodash'

import { SortOption, SortOrder } from '@banx/components/SortDropdown'

import { coreNew } from '@banx/api/nft'
import {
  calculateLoanRepayValue,
  isLoanLiquidated,
  isLoanRepaymentCallActive,
  isLoanTerminating,
} from '@banx/utils'

import styles from '../LoansActiveTable.module.less'

enum SortField {
  DEBT = 'debt',
  APR = 'apr',
  LTV = 'ltv',
  STATUS = 'status',
  DURATION = 'duration',
}

type SortValueGetter = (loan: coreNew.Loan) => number

const SORT_OPTIONS: SortOption<SortField>[] = [
  { label: 'Status', value: [SortField.STATUS, 'desc'] },
  { label: 'Debt', value: [SortField.DEBT, 'desc'] },
  { label: 'APR', value: [SortField.APR, 'desc'] },
  { label: 'LTV', value: [SortField.LTV, 'desc'] },
  { label: 'Duration', value: [SortField.DURATION, 'desc'] },
]

const SORT_VALUE_MAP: Record<SortField, string | SortValueGetter> = {
  [SortField.DEBT]: (loan) => calculateLoanRepayValue(loan).toNumber(),
  [SortField.APR]: (loan) => loan.bondTradeTransaction.amountOfBonds.toNumber(),
  [SortField.LTV]: (loan) =>
    calculateLoanRepayValue(loan).toNumber() / loan.nft.collectionFloor.toNumber(),
  [SortField.DURATION]: (loan) => loan.fraktBond.activatedAt.toNumber() * -1,
  [SortField.STATUS]: '',
}

const sortStatusLoans = (loans: coreNew.Loan[], order: SortOrder) => {
  const terminatingLoans = chain(loans)
    .filter(isLoanTerminating)
    .sortBy((loan) => loan.fraktBond.refinanceAuctionStartedAt)
    .reverse()
    .value()

  const repaymentCallLoans = chain(loans)
    .filter(isLoanRepaymentCallActive)
    .sortBy((loan) => loan.bondTradeTransaction.repaymentCallAmount)
    .reverse()
    .value()

  const otherLoans = chain(loans)
    .filter(
      (loan) =>
        !isLoanTerminating(loan) && !isLoanLiquidated(loan) && !isLoanRepaymentCallActive(loan),
    )
    .sortBy((loan) => loan.fraktBond.activatedAt)
    .reverse()
    .value()

  const combinedLoans = [...otherLoans, ...repaymentCallLoans, ...terminatingLoans]

  return order === 'asc' ? combinedLoans : combinedLoans.reverse()
}

export const useSortLoans = (loans: coreNew.Loan[]) => {
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
