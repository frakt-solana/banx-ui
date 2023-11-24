import { SortOption } from '@banx/components/SortDropdown'

export const SORT_OPTIONS = [
  { label: 'Lent', value: 'lent' },
  { label: 'LTV', value: 'ltv' },
  { label: 'APY', value: 'apy' },
  { label: 'Status', value: 'status' },
]

export const DEFAULT_SORT_OPTION: SortOption = {
  label: 'Status',
  value: 'status_asc',
}

const SECONDS_IN_HOUR = 60 * 60
export const SECONDS_IN_72_HOURS = 72 * SECONDS_IN_HOUR

export const EMPTY_MESSAGE = 'Your offer is waiting for a borrower'

export const STATUS_TOOLTIP_TEXT = 'Current status and duration of the loan that has been passed'
export const CLAIM_TOOLTIP_TEXT = 'Sum of lent amount and accrued interest to date'
