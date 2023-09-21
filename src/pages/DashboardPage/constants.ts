import { Tab } from '@banx/components/Tabs'

export enum DashboardTabName {
  BORROW = 'borrow',
  LEND = 'lend',
}

export const DASHBOARD_TABS: Tab[] = [
  {
    label: 'Borrow',
    value: 'borrow',
  },
  {
    label: 'Lend',
    value: 'lend',
  },
]

export const DEFAULT_TAB_VALUE = DASHBOARD_TABS[0].value
