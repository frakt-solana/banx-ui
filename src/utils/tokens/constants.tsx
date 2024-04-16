import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { USDC } from '@banx/icons'

export const RENT_FEE_BORROW_AMOUNT_IMPACT = {
  [LendingTokenType.NativeSol]: 4621440, //? Solana rent fee (lamports)
  [LendingTokenType.Usdc]: 0,
}

export const MIN_VALUE_TO_DISPLAY = {
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
  [LendingTokenType.Usdc]: [
    { limit: 10000, decimalPlaces: 0 }, //? Values up to 10000 have 0 decimal places
    { limit: 0.1, decimalPlaces: 2 }, //? Values up to 0.1 have 2 decimal places
    { limit: 0, decimalPlaces: 3 }, //? Values greater than 0 but less than 0.1 have 3 decimal places
  ],
  [LendingTokenType.NativeSol]: [
    { limit: 1000, decimalPlaces: 0 }, //? Values up to 1000 have 0 decimal places
    { limit: 0.01, decimalPlaces: 2 }, //? Values up to 0.01 have 2 decimal places
    { limit: 0, decimalPlaces: 3 }, //? Values greater than 0 but less than 0.01 have 3 decimal places
  ],
}

export const DEFAULT_DECIMAL_PLACES = 2
