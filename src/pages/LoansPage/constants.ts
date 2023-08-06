import { Tab } from '@banx/components/Tabs'

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

export enum LoansTabsNames {
  HISTORY = 'history',
  ACTIVE = 'active',
}
