import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { SortOption } from '@banx/components/SortDropdown'

export const DEFAULT_SORT_OPTION: SortOption = {
  label: 'Liquidity',
  value: 'liquidity_desc',
}

export const EMPTY_MESSAGE = "You don't have any whitelisted collections"

export const NOT_CONNECTED_MESSAGE = {
  [LendingTokenType.NativeSol]: 'Connect wallet to borrow SOL against your NFTs',
  [LendingTokenType.Usdc]: 'Connect wallet to borrow USDC against your NFTs',
}
