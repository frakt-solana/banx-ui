import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { core } from '@banx/api/tokens'

export interface BorrowToken {
  collateral: core.TokenMeta
  lendingTokenType: LendingTokenType
  amountInWallet: number
}

export const BORROW_TOKENS_LIST: BorrowToken[] = [
  {
    collateral: {
      mint: 'So11111111111111111111111111111111111111112',
      ticker: 'SOL',
      logoUrl:
        'https://statics.solscan.io/cdn/imgs/s60?ref=68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f736f6c616e612d6c6162732f746f6b656e2d6c6973742f6d61696e2f6173736574732f6d61696e6e65742f536f31313131313131313131313131313131313131313131313131313131313131313131313131313131322f6c6f676f2e706e67',
      decimals: 9,
      priceUsd: 0,
      totalSupply: '0',
      fullyDilutedValuation: '0',
      fullyDilutedValuationInMillions: '0',
      name: 'Wrapped SOL',
    },
    lendingTokenType: LendingTokenType.BanxSol,
    amountInWallet: 0,
  },
  {
    collateral: {
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      ticker: 'USDC',
      logoUrl:
        'https://statics.solscan.io/cdn/imgs/s60?ref=68747470733a2f2f7261772e67697468756275736572636f6e74656e742e636f6d2f736f6c616e612d6c6162732f746f6b656e2d6c6973742f6d61696e2f6173736574732f6d61696e6e65742f45506a465764643541756671535371654d32714e31787a7962617043384734774547476b5a777954447431762f6c6f676f2e706e67',
      decimals: 6,
      priceUsd: 0,
      totalSupply: '0',
      fullyDilutedValuation: '0',
      fullyDilutedValuationInMillions: '0',
      name: 'USD Coin',
    },
    lendingTokenType: LendingTokenType.Usdc,
    amountInWallet: 0,
  },
]
