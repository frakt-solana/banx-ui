import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

enum MarketType {
  SOL = 'sol',
  USDC = 'usdc',
}

export const LENDING_TOKEN_TO_MARKET_MAP: Record<LendingTokenType, MarketType> = {
  [LendingTokenType.NativeSol]: MarketType.SOL,
  [LendingTokenType.Usdc]: MarketType.USDC,
}

export const convertToMarketType = (tokenType: LendingTokenType): MarketType => {
  return LENDING_TOKEN_TO_MARKET_MAP[tokenType]
}
