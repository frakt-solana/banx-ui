import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

export const EMPTY_MESSAGE = "You don't have any whitelisted collections"

export const NOT_CONNECTED_MESSAGE = {
  [LendingTokenType.NativeSol]: 'Connect wallet to borrow SOL against your NFTs',
  [LendingTokenType.BanxSol]: 'Connect wallet to borrow SOL against your NFTs',
  [LendingTokenType.Usdc]: 'Connect wallet to borrow USDC against your NFTs',
}
