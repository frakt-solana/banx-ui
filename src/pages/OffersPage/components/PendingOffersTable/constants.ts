import { SortOption } from '@banx/components/SortDropdown'

export const SORT_OPTIONS = [
  { label: 'Offer', value: 'offer' },
  { label: 'Loans', value: 'loans' },
  { label: 'Size', value: 'size' },
  { label: 'Interest', value: 'interest' },
  { label: 'APR', value: 'apr' },
]

export const DEFAULT_SORT_OPTION: SortOption = {
  label: 'APR',
  value: 'apr_desc',
}

export const EMPTY_MESSAGE = 'Lend SOL to view your pending offers'
export const NOT_CONNECTED_MESSAGE = 'Connect wallet to view your pending offers'
