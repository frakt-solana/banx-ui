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

export const defaultSortOption: SortOption = {
  label: 'Duration',
  value: 'duration_asc',
}
