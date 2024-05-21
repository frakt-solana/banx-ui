import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

const SECONDS_IN_HOUR = 60 * 60
export const SECONDS_IN_72_HOURS = 72 * SECONDS_IN_HOUR

export const ACTIVITY_CSV_FILENAME = 'banx_lender_activity.csv'

export const NOT_CONNECTED_MESSAGE = 'Connect wallet to view your lending history'

export const EMPTY_MESSAGE = {
  [LendingTokenType.NativeSol]: 'Lend SOL to view your lending history',
  [LendingTokenType.BanxSol]: 'Lend SOL to view your lending history',
  [LendingTokenType.Usdc]: 'Lend USDC to view your lending history',
}
