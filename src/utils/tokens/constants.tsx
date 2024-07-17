import { BN } from 'fbonds-core'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { USDC } from '@banx/icons'
import { ZERO_BN } from '@banx/utils'

export const SOLANA_RENT_FEE_BORROW_AMOUNT_IMPACT = {
  [LendingTokenType.NativeSol]: new BN(4621440), //? Solana rent fee (lamports)
  [LendingTokenType.BanxSol]: new BN(4621440),
  [LendingTokenType.Usdc]: ZERO_BN,
}

export const MIN_VALUE_TO_DISPLAY = {
  [LendingTokenType.NativeSol]: 0.001,
  [LendingTokenType.BanxSol]: 0.001,
  [LendingTokenType.Usdc]: 0.01,
}

export const TOKEN_UNIT = {
  [LendingTokenType.NativeSol]: '◎',
  [LendingTokenType.Usdc]: <USDC />,
  [LendingTokenType.BanxSol]: '◎',
}

export const TOKEN_DECIMALS = {
  [LendingTokenType.NativeSol]: 1e9,
  [LendingTokenType.BanxSol]: 1e9,
  [LendingTokenType.Usdc]: 1e6,
}

export const DECIMAL_PLACES_LIMITS = {
  [LendingTokenType.Usdc]: [
    { limit: 100, decimalPlaces: 0 }, //? Values up to 100 have 0 decimal places
    { limit: 0.1, decimalPlaces: 2 }, //? Values up to 0.1 have 2 decimal places
    { limit: 0, decimalPlaces: 3 }, //? Values greater than 0 but less than 0.1 have 3 decimal places
  ],
  [LendingTokenType.NativeSol]: [
    { limit: 1000, decimalPlaces: 0 }, //? Values up to 1000 have 0 decimal places
    { limit: 0.01, decimalPlaces: 2 }, //? Values up to 0.01 have 2 decimal places
    { limit: 0, decimalPlaces: 3 }, //? Values greater than 0 but less than 0.01 have 3 decimal places
  ],
  [LendingTokenType.BanxSol]: [
    { limit: 1000, decimalPlaces: 0 }, //? Values up to 1000 have 0 decimal places
    { limit: 0.01, decimalPlaces: 2 }, //? Values up to 0.01 have 2 decimal places
    { limit: 0, decimalPlaces: 3 }, //? Values greater than 0 but less than 0.01 have 3 decimal places
  ],
}

export const DEFAULT_DECIMAL_PLACES = 2

export const MIN_COLLATERAL_VALUE_TO_DISPLAY = 0.001

export const COLLATERAL_DECIMAL_PLACES_LIMITS = [
  { limit: 1000, decimalPlaces: 0 }, //? Values up to 1000 have 0 decimal places
  { limit: 0.01, decimalPlaces: 2 }, //? Values up to 0.01 have 2 decimal places
  { limit: 0, decimalPlaces: 3 }, //? Values greater than 0 but less than 0.01 have 3 decimal places
]
