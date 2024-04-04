import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { USDC } from '@banx/icons'

export enum MarketType {
  SOL = 'sol',
  USDC = 'usdc',
}

export const TOKEN_THRESHOLD = {
  [LendingTokenType.NativeSOL]: 0.001,
  [LendingTokenType.USDC]: 0.01,
}

export const TOKEN_UNIT = {
  [LendingTokenType.NativeSOL]: '◎',
  [LendingTokenType.USDC]: <USDC />,
}

export const TOKEN_DECIMALS = {
  [LendingTokenType.NativeSOL]: 1e9,
  [LendingTokenType.USDC]: 1e6,
}

export const DECIMAL_PLACES_LIMITS = {
  [LendingTokenType.USDC]: [{ limit: 10000, decimalPlaces: 0 }],
  [LendingTokenType.NativeSOL]: [
    { limit: 1000, decimalPlaces: 0 },
    { limit: 0.01, decimalPlaces: 2 },
    { limit: 0, decimalPlaces: 3 },
  ],
}

export const DEFAULT_DECIMAL_PLACES = 2
