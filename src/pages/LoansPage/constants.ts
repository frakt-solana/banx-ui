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
    disabled: true,
  },
]

export const DEFAULT_SORT_OPTION: SortOption = {
  label: 'Duration',
  value: 'duration_asc',
}
