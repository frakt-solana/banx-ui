import { Tab } from '@banx/components/Tabs'

export enum OffersTabName {
  OFFERS = 'offers',
  HISTORY = 'history',
}

export const OFFERS_TABS: Tab[] = [
  {
    label: 'Offers',
    value: 'offers',
  },
  {
    label: 'History',
    value: 'history',
  },
]

export const DEFAULT_TAB_VALUE = OFFERS_TABS[0].value
