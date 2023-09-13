export interface SyntheticParams {
  loanValue: number
  loansAmount: number
}

export interface Order {
  size: number //? normal sol value
  loanValue: number //? normal sol value
  loansAmount: number
  synthetic?: boolean
  rawData: {
    publicKey: string
    assetReceiver: string
  }
}
