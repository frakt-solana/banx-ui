import { SortOption } from '@banx/components/SortDropdown'

import { LoansPreview, SortField } from './types'

export const TOOLTIP_TEXTS = {
  PRICE: 'Token market price',
  TOTAL_DEBT: 'Total amount of outstanding debt for the token',
  WLTV: 'Weighted Loan-to-Value ratio (LTV)',
  WAPR: 'Weighted average annual percentage rate (APR)',
}

// * Sorting * //
export const SORT_OPTIONS: SortOption<SortField>[] = [
  { label: 'APR', value: [SortField.APR, 'desc'] },
  { label: 'Debt', value: [SortField.DEBT, 'desc'] },
  { label: 'LTV', value: [SortField.LTV, 'desc'] },
]

export const SORT_VALUE_MAP: Record<SortField, (loan: LoansPreview) => number> = {
  [SortField.APR]: (preview) => preview.weightedApr,
  [SortField.DEBT]: (preview) => preview.totalDebt,
  [SortField.LTV]: (preview) => preview.weightedLtv,
}

export enum TableColumnKey {
  DEBT = 'debt',
  APR = 'apr',
  LTV = 'ltv',
  STATUS = 'status',
  DURATION = 'duration',
}

// * Sorting * //

export const PARTIAL_REPAY_ACCOUNT_CREATION_FEE = 3229 * 1e3
