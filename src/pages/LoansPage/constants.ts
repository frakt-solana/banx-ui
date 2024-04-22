import { Tab } from '@banx/components/Tabs'

export enum LoansTabsNames {
  REQUESTS = 'requests',
  LOANS = 'loans',
  HISTORY = 'history',
}

export const LOANS_TABS: Tab[] = [
  {
    label: 'Requests',
    value: LoansTabsNames.REQUESTS,
  },
  {
    label: 'Loans',
    value: LoansTabsNames.LOANS,
  },
  {
    label: 'History',
    value: LoansTabsNames.HISTORY,
  },
]

export const DEFAULT_TAB_VALUE = LOANS_TABS[0].value

const SECONDS_IN_HOUR = 60 * 60
export const SECONDS_IN_72_HOURS = 72 * SECONDS_IN_HOUR
