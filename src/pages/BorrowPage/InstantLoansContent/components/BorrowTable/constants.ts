export const SORT_OPTIONS = [
  { label: 'Floor', value: 'floorPrice' },
  { label: 'Borrow', value: 'loanValue' },
  { label: 'Fee', value: 'weeklyFee' },
]

export const DEFAULT_TABLE_SORT = {
  label: 'Borrow',
  value: 'loanValue_desc',
}

export const ONE_WEEK_IN_SECONDS = 7 * 24 * 60 * 60
