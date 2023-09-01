import { SortOption } from '@banx/components/SortDropdown'
import { Tab } from '@banx/components/Tabs'

export enum LoansTabsNames {
  HISTORY = 'history',
  ACTIVE = 'active',
}

export const LOANS_TABS: Tab[] = [
  {
    label: 'Active',
    value: 'active',
  },
  {
    label: 'History',
    value: 'history',
  },
]

export const DEFAULT_TAB_VALUE = LOANS_TABS[0].value

export const DEFAULT_SORT_OPTION: SortOption = {
  label: 'Loan status',
  value: 'status_asc',
}

const SECONDS_IN_HOUR = 60 * 60
export const SECONDS_IN_72_HOURS = 72 * SECONDS_IN_HOUR
