export interface SyntheticParams {
  loanValue: number
  loansAmount: number
}

export interface MarketOrder {
  size: number //? normal sol value
  loanValue: number //? normal sol value
  loansAmount: number
  synthetic?: boolean
  rawData: {
    publicKey: string
    assetReceiver: string
    bondFeature?: string
    loanToValueFilter?: number
  }
}
