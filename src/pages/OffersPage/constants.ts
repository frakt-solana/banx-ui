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
