import { BN, web3 } from 'fbonds-core'
import { calcBorrowerTokenAPR } from 'fbonds-core/lib/fbond-protocol/helpers'
import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'

import { convertBondOfferV3ToCore } from '@banx/api/nft'
import { TokenLoan } from '@banx/api/tokens'
import { ZERO_BN, caclulateBorrowTokenLoanValue, calculateIdleFundsInOffer } from '@banx/utils'

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
