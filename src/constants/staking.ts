import { BN } from 'fbonds-core'

export const BANX_TOKEN_STAKE_DECIMAL = 1e9
export const TOTAL_BANX_NFTS = 7_777
export const TOTAL_BANX_NFTS_PARTNER_POINTS = 483_480
export const BANX_TOKEN_DECIMALS = 9
export const BANX_TOKEN_APPROX_CIRCULATING_AMOUNT = new BN(9 * 1e9).mul(
  new BN(10 ** BANX_TOKEN_DECIMALS),
) //? 9 billion
