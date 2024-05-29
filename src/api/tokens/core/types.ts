// import { BN } from 'fbonds-core'
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

  collateralPrice: number
  collateralDecimals: number
  bestOffer: number

  activeOffersAmount: number
  offersTvl: number
  activeLoansAmount: number
  loansTvl: number

  marketApr: number
  marketApy: number

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

  collateralImageUrl: string
  collateralTicker: string
}

export interface TokenMarketPreviewResponse {
  data: TokenMarketPreview[]
  meta: PaginationMeta
}
