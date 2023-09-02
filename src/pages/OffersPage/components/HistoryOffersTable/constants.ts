import { SortOption } from '@banx/components/SortDropdown'

export const DEFAULT_SORT_OPTION: SortOption = {
  label: 'When',
  value: 'timestamp_desc',
}

const SECONDS_IN_HOUR = 60 * 60
export const SECONDS_IN_72_HOURS = 72 * SECONDS_IN_HOUR

export const ACTIVITY_CSV_FILENAME = 'frakt_activity.csv'
