import { TokenLoan } from '@banx/api/tokens'

export interface LoansPreview {
  collateralMint: string
  collareralTicker: string
  collateralLogoUrl: string

  collateralPrice: number
  totalDebt: number
  weightedLtv: number
  weightedApr: number
  terminatingLoansAmount: number
  repaymentCallsAmount: number
  loans: TokenLoan[]
}

export enum SortField {
  APR = 'apr',
  DEBT = 'debt',
  LTV = 'ltv',
}
