import { core } from '@banx/api/tokens'

export interface BorrowCollateral {
  meta: core.TokenMeta

  marketPubkey?: string
  fraktMarket?: string
  available?: number
}

export const COLLATERAL_TOKENS_LIST: BorrowCollateral[] = [
  {
    meta: {
      mint: 'BANXbTpN8U2cU41FjPxe2Ti37PiT5cCxLUKDQZuJeMMR',
      ticker: 'BANX',
      imageUrl:
        'https://statics.solscan.io/cdn/imgs/s60?ref=68747470733a2f2f617277656176652e6e65742f3551526974514750566a5077706a74343351655f5749536d7973346457774c4d715171514454306f736867',
      decimals: 9,
      priceUSDC: 0.001,
    },

    available: 7777,
    marketPubkey: '9vMKEMq8G36yrkqVUzQuAweieCsxU9ZaK1ob8GRegwmh',
  },
]

export const DEFAULT_COLLATERAL_TOKEN = COLLATERAL_TOKENS_LIST[0]

export const BORROW_MOCK_TOKENS_LIST: BorrowCollateral[] = [
  {
    meta: {
      mint: 'So11111111111111111111111111111111111111112',
      ticker: 'SOL',
      imageUrl:
        'https://statics.solscan.io/cdn/imgs/s60?ref=68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f736f6c616e612d6c6162732f746f6b656e2d6c6973742f6d61696e2f6173736574732f6d61696e6e65742f536f31313131313131313131313131313131313131313131313131313131313131313131313131313131322f6c6f676f2e706e67',
      decimals: 9,
      priceUSDC: 0.001,
    },
    available: 240,
  },
  {
    meta: {
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      ticker: 'USDC',
      imageUrl:
        'https://statics.solscan.io/cdn/imgs/s60?ref=68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f736f6c616e612d6c6162732f746f6b656e2d6c6973742f6d61696e2f6173736574732f6d61696e6e65742f45506a465764643541756671535371654d32714e31787a7962617043384734774547476b5a777954447431762f6c6f676f2e706e67',
      decimals: 6,
      priceUSDC: 0.001,
    },
    available: 240,
  },
]
