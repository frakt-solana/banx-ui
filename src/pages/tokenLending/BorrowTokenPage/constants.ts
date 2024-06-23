import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { core } from '@banx/api/tokens'

export interface BorrowToken {
  meta: core.TokenMeta

  collateralPrice: number
  lendingTokenType: LendingTokenType
  marketPubkey?: string
  fraktMarket?: string
  available?: number
}

export const MOCK_APR_RATE = 34 * 100

export const COLLATERAL_TOKENS_LIST: BorrowToken[] = [
  {
    meta: {
      mint: 'BANXbTpN8U2cU41FjPxe2Ti37PiT5cCxLUKDQZuJeMMR',
      ticker: 'BANX',
      logoUrl: 'https://arweave.net/5QRitQGPVjPwpjt43Qe_WISmys4dWwLMqQqQDT0oshg',
      decimals: 9,
      priceUsd: 0.001,
    },

    marketPubkey: '9vMKEMq8G36yrkqVUzQuAweieCsxU9ZaK1ob8GRegwmh',
    lendingTokenType: LendingTokenType.BanxSol,
    collateralPrice: 0,
    available: 7777,
  },
]

export const DEFAULT_COLLATERAL_TOKEN = COLLATERAL_TOKENS_LIST[0]

export const BORROW_TOKENS_LIST: BorrowToken[] = [
  {
    meta: {
      mint: 'So11111111111111111111111111111111111111112',
      ticker: 'SOL',
      logoUrl:
        'https://statics.solscan.io/cdn/imgs/s60?ref=68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f736f6c616e612d6c6162732f746f6b656e2d6c6973742f6d61696e2f6173736574732f6d61696e6e65742f536f31313131313131313131313131313131313131313131313131313131313131313131313131313131322f6c6f676f2e706e67',
      decimals: 9,
      priceUsd: 0.001,
    },
    lendingTokenType: LendingTokenType.NativeSol,
    collateralPrice: 0,
    available: 240,
  },
  {
    meta: {
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      ticker: 'USDC',
      logoUrl:
        'https://statics.solscan.io/cdn/imgs/s60?ref=68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f736f6c616e612d6c6162732f746f6b656e2d6c6973742f6d61696e2f6173736574732f6d61696e6e65742f45506a465764643541756671535371654d32714e31787a7962617043384734774547476b5a777954447431762f6c6f676f2e706e67',
      decimals: 6,
      priceUsd: 0.001,
    },
    lendingTokenType: LendingTokenType.Usdc,
    collateralPrice: 0,
    available: 240,
  },
]

export const DEFAULT_BORROW_TOKEN = BORROW_TOKENS_LIST[0]
