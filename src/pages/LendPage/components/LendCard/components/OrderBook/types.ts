import { BondFeatures } from 'fbonds-core/lib/fbond-protocol/types'

export interface SyntheticParams {
  loanValue: number
  loansAmount: number
}

export interface MarketOrder {
  loanValue: number //? normal sol value
  size: number //? normal sol value
  loansAmount: number
  rawData: {
    publicKey: string
    assetReceiver: string
    bondFeature: BondFeatures
    loanToValueFilter: number
  }
}
