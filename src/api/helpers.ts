import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

enum MarketType {
  SOL = 'sol',
  USDC = 'usdc',
  BANXSOL = 'banxSol',
}

const LENDING_TOKEN_TO_MARKET_MAP: Record<LendingTokenType, MarketType> = {
  [LendingTokenType.NativeSol]: MarketType.SOL,
  [LendingTokenType.BanxSol]: MarketType.BANXSOL,
  [LendingTokenType.Usdc]: MarketType.USDC,
}

export const convertToMarketType = (tokenType: LendingTokenType): MarketType => {
  return LENDING_TOKEN_TO_MARKET_MAP[tokenType]
}

export enum OutputToken {
  SOL = 'SOL',
  USDC = 'USDC',
  BanxSOL = 'BanxSOL',
}

//TODO (TokenLending): Remove it when sync LendingTokenType with OutputToken
export const convertToOutputToken = (outputToken: LendingTokenType): OutputToken => {
  if (outputToken === LendingTokenType.NativeSol) {
    return OutputToken.BanxSOL
  }
  if (outputToken === LendingTokenType.Usdc) {
    return OutputToken.USDC
  }

  return OutputToken.SOL
}
