import { SortOption } from '@banx/components/SortDropdown'
import { Tab } from '@banx/components/Tabs'

export enum OffersTabName {
  PENDING = 'pending',
  HISTORY = 'history',
  ACTIVE = 'active',
}

export const OFFERS_TABS: Tab[] = [
  {
    label: 'Pending',
    value: 'pending',
  },
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
  label: 'Apr',
  value: 'apr_asc',
}
