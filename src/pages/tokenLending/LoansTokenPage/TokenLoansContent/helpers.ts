import { BN, web3 } from 'fbonds-core'
import {
  calculateCurrentInterestSolPure,
  calculatePartOfLoanBodyFromInterest,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { calcBorrowerTokenAPR } from 'fbonds-core/lib/fbond-protocol/helpers'
import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'
import { filter, first, groupBy, size, sumBy } from 'lodash'
import moment from 'moment'

import { convertBondOfferV3ToCore } from '@banx/api/nft'
import { TokenLoan } from '@banx/api/tokens'
import {
  ZERO_BN,
  caclulateBorrowTokenLoanValue,
  calculateIdleFundsInOffer,
  isBanxSolTokenType,
  isTokenLoanRepaymentCallActive,
  isTokenLoanTerminating,
} from '@banx/utils'

import { PARTIAL_REPAY_ACCOUNT_CREATION_FEE } from './constants'
import { LoansPreview } from './types'

export const buildLoansPreviewGroupedByMint = (loans: TokenLoan[]): LoansPreview[] => {
  const groupedLoans = groupBy(loans, (loan) => loan.collateral.mint)

  return Object.entries(groupedLoans).map(([collateralMint, loans]) => {
    const weightedLtv = 0
    const weightedApr = 0

    const { collateralPrice = 0, collateral } = first(loans) || {}

    const collareralTicker = collateral?.ticker || ''
    const collateralLogoUrl = collateral?.logoUrl || ''

    const totalDebt = sumBy(loans, (loan) => caclulateBorrowTokenLoanValue(loan).toNumber())

    const terminatingLoansAmount = size(filter(loans, isTokenLoanTerminating))
    const repaymentCallsAmount = size(filter(loans, isTokenLoanRepaymentCallActive))

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

//? This fee is associated with account creation. It's used to display the correct value when the SOL token type is used.
const getPartialRepayRentFee = (loan: TokenLoan) => {
  return isBanxSolTokenType(loan.bondTradeTransaction.lendingToken)
    ? PARTIAL_REPAY_ACCOUNT_CREATION_FEE
    : 0
}

export const calculateAccruedInterest = (loan: TokenLoan) => {
  const { amountOfBonds, solAmount, soldAt } = loan.bondTradeTransaction

  const borrowerApr = calcBorrowerTokenAPR(
    amountOfBonds,
    new web3.PublicKey(loan.fraktBond.hadoMarket),
  )

  return calculateCurrentInterestSolPure({
    loanValue: solAmount,
    startTime: soldAt,
    currentTime: moment().unix(),
    rateBasePoints: borrowerApr,
  })
}

const calculateUnpaidInterest = (loan: TokenLoan) => {
  const { lenderFullRepaidAmount } = loan.bondTradeTransaction

  const accruedInterest = calculateAccruedInterest(loan)
  const rentFee = getPartialRepayRentFee(loan)

  const unpaidInterest = Math.max(0, accruedInterest - lenderFullRepaidAmount)

  const percentToRepay = calcPercentToPay(loan, unpaidInterest)
  //? Check that the percentageToRepay is greater than 1, since the minimum loan payment is one percent.
  return percentToRepay >= 1 ? unpaidInterest + rentFee : 0
}

const calcPercentToPay = (loan: TokenLoan, iterestToPay: number) => {
  const { soldAt, amountOfBonds, solAmount } = loan.bondTradeTransaction

  const borrowerApr = calcBorrowerTokenAPR(
    amountOfBonds,
    new web3.PublicKey(loan.fraktBond.hadoMarket),
  )

  const partOfLoan = calculatePartOfLoanBodyFromInterest({
    soldAt,
    iterestToPay,
    rateBasePoints: borrowerApr,
  })

  return (partOfLoan / solAmount) * 100
}

export const caclFractionToRepay = (loan: TokenLoan) => {
  const iterestToPay = calculateUnpaidInterest(loan)
  const percentToRepay = calcPercentToPay(loan, iterestToPay)

  return Math.ceil(percentToRepay * 100)
}

export const caclFractionToRepayForRepaymentCall = (loan: TokenLoan) => {
  const debtWithoutFee = caclulateBorrowTokenLoanValue(loan, false).toNumber()
  const repaymentCallAmount = loan.bondTradeTransaction.repaymentCallAmount

  const unroundedRepaymentPercentage = (repaymentCallAmount / debtWithoutFee) * 100
  return Math.ceil(unroundedRepaymentPercentage * 100)
}

export const calcTokenTotalValueToPay = (loan: TokenLoan) => {
  if (isTokenLoanRepaymentCallActive(loan)) {
    return loan.bondTradeTransaction.repaymentCallAmount
  }

  return calculateUnpaidInterest(loan)
}

type CalculateTokensToGet = (props: {
  offer: BondOfferV3
  loan: TokenLoan
  marketTokenDecimals: number
}) => BN

export const calculateTokensToGet: CalculateTokensToGet = ({
  offer,
  loan,
  marketTokenDecimals,
}) => {
  const maxTokenToGet = calculateIdleFundsInOffer(convertBondOfferV3ToCore(offer))

  //? Adjust 'maxTokenToGet' by excluding the concentration index, as the borrow refinance instruction
  //? now operates only with 'bidSettlement' + 'fundsSolOrTokenBalance'. Will be fixed in the future!
  const adjustedMaxTokenToGet = maxTokenToGet.sub(offer.concentrationIndex)

  const tokenSupply = loan.fraktBond.fbondTokenSupply
  const collateralsPerToken = offer.validation.collateralsPerToken

  if (!tokenSupply || !collateralsPerToken) return ZERO_BN

  const marketTokenDecimalsMultiplier = new BN(10).pow(new BN(marketTokenDecimals))

  const tokensToGet = BN.min(
    new BN(tokenSupply).mul(marketTokenDecimalsMultiplier).div(collateralsPerToken),
    adjustedMaxTokenToGet,
  )

  return tokensToGet
}

export const getCurrentLoanInfo = (loan: TokenLoan) => {
  const currentLoanDebt = caclulateBorrowTokenLoanValue(loan).toNumber()
  const currentLoanBorrowedAmount = loan.fraktBond.borrowedAmount
  const currentApr = calcBorrowerTokenAPR(
    loan.bondTradeTransaction.amountOfBonds,
    new web3.PublicKey(loan.fraktBond.hadoMarket),
  )

  return {
    currentLoanDebt,
    currentLoanBorrowedAmount,
    currentApr,
  }
}
