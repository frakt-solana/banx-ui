import { SortOption } from '@banx/components/SortDropdown'

export const SORT_OPTIONS = [
  { label: 'Claim', value: 'claim' },
  { label: 'Lent', value: 'lent' },
  { label: 'Offer', value: 'offer' },
]

export const DEFAULT_SORT_OPTION: SortOption = {
  label: SORT_OPTIONS[0].label,
  value: `${SORT_OPTIONS[0].value}_asc`,
}

export const EMPTY_LOANS_MESSAGE = 'Your offer is waiting for a borrower'

export const STATUS_TOOLTIP_TEXT = 'Current status and duration of the loan that has been passed'
export const CLAIM_TOOLTIP_TEXT = 'Sum of lent amount and accrued interest to date'
