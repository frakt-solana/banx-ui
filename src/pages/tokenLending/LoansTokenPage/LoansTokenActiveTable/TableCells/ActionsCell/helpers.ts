import { BN } from 'fbonds-core'
import { calculateAPRforOffer } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { core } from '@banx/api/tokens'
import { bnToHuman, getTokenDecimals } from '@banx/utils'

type CalculateTokenBorrowApr = (loan: core.TokenLoan, offer: core.BorrowSplTokenOffers) => number
export const calculateTokenBorrowApr: CalculateTokenBorrowApr = (loan, offer) => {
  const tokenDesimals = getTokenDecimals(loan.bondTradeTransaction.lendingToken)
  const desimalPlaces = Math.log10(tokenDesimals) //? f.e 1e9 => 9, 1e6 => 6

  const amountToGet = bnToHuman(new BN(offer.amountToGet, 'hex'), desimalPlaces)
  const amountToGive = bnToHuman(new BN(offer.amountToGive, 'hex'), loan.collateral.decimals)

  const collateralPerToken = amountToGet / amountToGive

  const ltvPercent = (collateralPerToken / loan.collateralPrice) * 100

  const fullyDilutedValuationNumber = parseFloat(loan.collateral.fullyDilutedValuationInMillions)

  const { factoredApr } = calculateAPRforOffer(ltvPercent, fullyDilutedValuationNumber)
  const aprRate = factoredApr * 100

  return aprRate
}

type CalculateNewLoanInfo = (props: {
  offer: core.BorrowSplTokenOffers | undefined
  loan: core.TokenLoan
  currentLoanDebt: number
}) => {
  newLoanDebt: number
  newLoanBorrowed: number
  newLoanApr: number
  upfrontFee: number
}

export const calculateNewLoanInfo: CalculateNewLoanInfo = ({ loan, offer, currentLoanDebt }) => {
  if (!offer)
    return {
      newLoanDebt: 0,
      newLoanBorrowed: 0,
      newLoanApr: 0,
      upfrontFee: 0,
    }

  const newLoanDebt = new BN(offer.amountToGet, 'hex').toNumber()
  const upfrontFee = Math.max((newLoanDebt - currentLoanDebt) / 100, 0)
  const newLoanBorrowed = newLoanDebt - upfrontFee
  const newLoanApr = calculateTokenBorrowApr(loan, offer)

  return {
    newLoanDebt,
    newLoanBorrowed,
    newLoanApr,
    upfrontFee,
  }
}
