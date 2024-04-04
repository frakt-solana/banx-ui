import { USDC } from '@banx/icons'

import { TokenType } from './types'

export const THRESHOLD_MAP = {
  [TokenType.SOL]: 0.001,
  [TokenType.USDC]: 0.01,
}

export const TOKEN_UNIT = {
  [TokenType.SOL]: '◎',
  [TokenType.USDC]: <USDC />,
}

export const DECIMALS_MAP = {
  [TokenType.SOL]: 1e9,
  [TokenType.USDC]: 1e6,
}

export const DECIMAL_PLACES_CONFIG = {
  usdc: [{ limit: 10000, decimalPlaces: 0 }],
  sol: [
    { limit: 1000, decimalPlaces: 0 },
    { limit: 0.01, decimalPlaces: 2 },
    { limit: 0, decimalPlaces: 3 },
  ],
}

export const DEFAULT_DECIMAL_PLACES = 2
