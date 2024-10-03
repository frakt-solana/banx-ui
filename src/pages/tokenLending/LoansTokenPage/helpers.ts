import { first, groupBy, map, size, sumBy } from 'lodash'

import { TokenLoan } from '@banx/api/tokens'
import {
  caclulateBorrowTokenLoanValue,
  isTokenLoanRepaymentCallActive,
  isTokenLoanTerminating,
} from '@banx/utils'

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

export const buildLoansPreviewGroupedByMint = (loans: TokenLoan[]): LoansPreview[] => {
  const groupedLoans = groupBy(loans, (loan) => loan.collateral.mint)

  return Object.entries(groupedLoans).map(([collateralMint, loans]) => {
    const weightedLtv = 0
    const weightedApr = 0

    const { collateralPrice = 0, collateral } = first(loans) || {}
    const collareralTicker = collateral?.ticker || ''
    const collateralLogoUrl = collateral?.logoUrl || ''

    const totalDebt = sumBy(loans, (loan) => caclulateBorrowTokenLoanValue(loan).toNumber())

    const terminatingLoansAmount = size(map(loans, isTokenLoanTerminating))
    const repaymentCallsAmount = size(map(loans, isTokenLoanRepaymentCallActive))

    return {
      collateralMint,
      collareralTicker,
      collateralLogoUrl,

      collateralPrice,
      totalDebt,
      weightedLtv,
      weightedApr,
      terminatingLoansAmount,
      repaymentCallsAmount,
      loans,
    }
  })
}
