import { SortOption } from '@banx/components/SortDropdown'

import { LoansPreview, SortField } from './types'

export const TOOLTIP_TEXTS = {
  PRICE: 'PRICE',
  TOTAL_DEBT: 'TOTAL_DEBT',
  WLTV: 'WLTV',
  WAPR: 'TWAPR',
}

// * Sorting *//
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
// * Sorting *//
