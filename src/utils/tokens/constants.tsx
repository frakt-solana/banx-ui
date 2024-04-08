import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { USDC } from '@banx/icons'

export const RENT_FEE_BORROW_AMOUNT_IMPACT = {
  [LendingTokenType.NativeSol]: 4621440, //? Solana rent fee (lamports)
  [LendingTokenType.Usdc]: 0,
}

export const MINIMUM_DISPLAYABLE_TOKEN_VALUE = {
  [LendingTokenType.NativeSol]: 0.001,
  [LendingTokenType.Usdc]: 0.01,
}

export const TOKEN_UNIT = {
  [LendingTokenType.NativeSol]: '◎',
  [LendingTokenType.Usdc]: <USDC />,
}

export const TOKEN_DECIMALS = {
  [LendingTokenType.NativeSol]: 1e9,
  [LendingTokenType.Usdc]: 1e6,
}

export const DECIMAL_PLACES_LIMITS = {
  [LendingTokenType.Usdc]: [{ limit: 10000, decimalPlaces: 0 }],
  [LendingTokenType.NativeSol]: [
    { limit: 1000, decimalPlaces: 0 },
    { limit: 0.01, decimalPlaces: 2 },
    { limit: 0, decimalPlaces: 3 },
  ],
}

export const DEFAULT_DECIMAL_PLACES = 2
