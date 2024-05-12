import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

export const ACTIVITY_CSV_FILENAME = 'banx_borrower_activity.csv'

export const DEFAULT_SORT_OPTION = {
  label: 'When',
  value: 'timestamp_desc',
}
export const NOT_CONNECTED_MESSAGE = 'Connect wallet to view your loan history'

export const EMPTY_MESSAGE = {
  [LendingTokenType.NativeSol]:
    'Once you have borrowed some SOL, your loan history will appear here',
  [LendingTokenType.Usdc]: 'Once you have borrowed some USDC, your loan history will appear here',
}
