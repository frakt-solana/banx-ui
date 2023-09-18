import { SortOption } from '@banx/components/SortDropdown'

export const DEFAULT_SORT_OPTION: SortOption = {
  label: 'Loan status',
  value: 'status_asc',
}

const SECONDS_IN_HOUR = 60 * 60
export const SECONDS_IN_72_HOURS = 72 * SECONDS_IN_HOUR

export const EMPTY_MESSAGE = 'Lend SOL to view your active loans'
export const NOT_CONNECTED_MESSAGE = 'Connect wallet to view your active loans'
