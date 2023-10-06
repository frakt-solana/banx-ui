import { Tab } from '@banx/components/Tabs'

export enum GovernanceTabsNames {
  HISTORY = 'history',
  ACTIVE = 'active',
}

export const GOVERNANCE_TABS: Tab[] = [
  {
    label: 'Active',
    value: 'active',
  },
  {
    label: 'History',
    value: 'history',
  },
]

export const DEFAULT_TAB_VALUE = GOVERNANCE_TABS[0].value
