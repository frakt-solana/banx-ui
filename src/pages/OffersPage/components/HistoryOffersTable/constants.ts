import { SortOption } from '@banx/components/SortDropdown'

export const DEFAULT_SORT_OPTION: SortOption = {
  label: 'APR',
  value: 'apr_desc',
}

const SECONDS_IN_HOUR = 60 * 60
export const SECONDS_IN_72_HOURS = 72 * SECONDS_IN_HOUR

export const ACTIVITY_CSV_FILENAME = 'frakt_activity.csv'

export const EMPTY_MESSAGE = 'Lend SOL to view your lending history'
export const NOT_CONNECTED_MESSAGE = 'Connect wallet to view your lending history'
