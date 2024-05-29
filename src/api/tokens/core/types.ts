import { BN } from 'fbonds-core'
import { BondTradeTransactionV3, FraktBond } from 'fbonds-core/lib/fbond-protocol/types'

import { PaginationMeta } from '@banx/api/types'

type TokenMeta = {
  mint: string
  imageUrl: string
  ticker: string
  decimals: BN
  priceUSDC: BN
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

  collateralPrice: BN
  collateralDecimals: BN
  bestOffer: BN

  activeOffersAmount: BN
  offersTvl: BN
  activeLoansAmount: BN
  loansTvl: BN

  marketApr: BN
  marketApy: BN

  collateralImageUrl: string
  collateralTicker: string
}

export interface TokenMarketPreviewResponse {
  data: TokenMarketPreview[]
  meta: PaginationMeta
}
