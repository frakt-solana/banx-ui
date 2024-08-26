import { BN } from 'fbonds-core'
import { BASE_POINTS } from 'fbonds-core/lib/fbond-protocol/constants'
import moment from 'moment'

import { core } from '@banx/api/tokens'
import {
  calculateLentTokenValueWithInterest,
  calculateTokenLoanLtvByLoanValue,
  calculateTokenRepaymentCallLenderReceivesAmount,
  isTokenLoanRepaymentCallActive,
} from '@banx/utils'

export const calculateFreezeExpiredAt = (loan: core.TokenLoan) => {
  return loan.bondTradeTransaction.soldAt + loan.bondTradeTransaction.terminationFreeze
}

export const checkIfFreezeExpired = (loan: core.TokenLoan) => {
  const freezeExpiredAt = calculateFreezeExpiredAt(loan)
  const currentTimeInSeconds = moment().unix()
  return currentTimeInSeconds > freezeExpiredAt
}

export const calculateRepaymentStaticValues = (loan: core.TokenLoan) => {
  const DEFAULT_REPAY_PERCENT = 50

  const repaymentCallActive = isTokenLoanRepaymentCallActive(loan)

  const repaymentCallLenderReceives = calculateTokenRepaymentCallLenderReceivesAmount(loan)

  const totalClaim = calculateLentTokenValueWithInterest(loan).toNumber()

  const initialRepayPercent = repaymentCallActive
    ? (repaymentCallLenderReceives / totalClaim) * 100
    : DEFAULT_REPAY_PERCENT

  const initialRepayValue = repaymentCallActive
    ? repaymentCallLenderReceives
    : totalClaim * (initialRepayPercent / 100)

  return {
    repaymentCallActive,
    totalClaim,
    initialRepayPercent,
    initialRepayValue,
  }
}

const BASE_POINTS_BN = new BN(BASE_POINTS)
export const calculateCollateralsPerTokenByFromLtv = (params: { ltv: BN; tokenPrice: BN }): BN => {
  const { ltv, tokenPrice } = params
  return tokenPrice.mul(BASE_POINTS_BN).div(ltv)
}

export const calculateCollateralsPerTokenByLoan = (
  loan: core.TokenLoan,
  marketTokenDecimals: number,
): BN => {
  const lentTokenValueWithInterest = calculateLentTokenValueWithInterest(loan).toNumber()
  const ltvPercent = calculateTokenLoanLtvByLoanValue(loan, lentTokenValueWithInterest)

  const collateralTokenDecimals = loan.collateral.decimals
  const collateralTokenDecimalsMultiplier = new BN(10 ** collateralTokenDecimals)
  const marketTokenDecimalsMultiplier = new BN(10 ** marketTokenDecimals)

  const loanCollateralsPerToken = calculateCollateralsPerTokenByFromLtv({
    ltv: new BN(ltvPercent * 100),
    tokenPrice: collateralTokenDecimalsMultiplier
      .mul(marketTokenDecimalsMultiplier)
      .div(new BN(loan.collateralPrice)),
  })

  return loanCollateralsPerToken
}
