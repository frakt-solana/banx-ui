import { BondTradeTransactionV3, FraktBond } from 'fbonds-core/lib/fbond-protocol/types'

import { PaginationMeta } from '@banx/api/types'

type TokenMeta = {
  mint: string
  imageUrl: string
  ticker: string

  decimals: number
  priceUSDC: number

  //TODO: uncomment when converter is ready
  // decimals: BN
  // priceUSDC: BN
}

export type TokenLoan = {
  publicKey: string
  fraktBond: FraktBond
  bondTradeTransaction: BondTradeTransactionV3
  collateral: TokenMeta
}

export type TokenMarketPreview = {
  marketPubkey: string
  tokenType: string

  collateralTokenPrice: number
  collateralTokenDecimals: number
  bestOffer: number

  activeOffersAmount: number
  offersTvl: number
  activeLoansAmount: number
  loansTvl: number

  marketApr: number
  marketApy: number

  collateralTokenImageUrl: string
  collateralTokenTicker: string

  //TODO: uncomment when converter is ready
  // collateralPrice: BN
  // collateralDecimals: BN
  // bestOffer: BN

  // activeOffersAmount: BN
  // offersTvl: BN
  // activeLoansAmount: BN
  // loansTvl: BN

  // marketApr: BN
  // marketApy: BN
}

export interface TokenMarketPreviewResponse {
  data: TokenMarketPreview[]
  meta: PaginationMeta
}

export interface TokenOfferPreview {
  publicKey: string
  tokenMarketPreview: TokenMarketPreview
  tokenOfferPreview: {
    publicKey: string
    liquidatedLoansAmount: number
    terminatingLoansAmount: number
    repaymentCallsAmount: number
    inLoans: number
    offerSize: number
    accruedInterest: number
  }
}
