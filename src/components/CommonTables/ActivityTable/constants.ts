export enum ActivityEvent {
  ALL = 'all',
  LOANED = 'loaned',
  REPAID = 'repaid',
  LIQUIDATED = 'liquidated',
}

export const RADIO_BUTTONS_OPTIONS = [
  {
    label: 'All',
    value: ActivityEvent.ALL,
  },
  {
    label: 'Loaned',
    value: ActivityEvent.LOANED,
  },
  {
    label: 'Repaid',
    value: ActivityEvent.REPAID,
  },
  {
    label: 'Liquidated',
    value: ActivityEvent.LIQUIDATED,
  },
]
