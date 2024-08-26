import { BN } from 'fbonds-core'
import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'

import { convertBondOfferV3ToCore } from '@banx/api/nft'
import { core } from '@banx/api/tokens'
import { adjustAmountWithUpfrontFee } from '@banx/pages/tokenLending/BorrowTokenPage/InstantBorrowContent/helpers'
import { ZERO_BN } from '@banx/utils'
import {
  caclulateBorrowTokenLoanValue,
  calculateIdleFundsInOffer,
  calculateTokenLoanValueWithUpfrontFee,
} from '@banx/utils/core'

type CalculateTokenToGet = (props: {
  offer: BondOfferV3
  loan: core.TokenLoan
  marketTokenDecimals: number
}) => BN

export const calculateTokenToGet: CalculateTokenToGet = ({ offer, loan, marketTokenDecimals }) => {
  const maxTokenToGet = calculateIdleFundsInOffer(convertBondOfferV3ToCore(offer))

  const tokenSupply = loan.fraktBond.fbondTokenSupply
  const collateralsPerToken = offer.validation.collateralsPerToken

  if (!tokenSupply || !collateralsPerToken) return ZERO_BN

  const marketTokenDecimalsMultiplier = new BN(10).pow(new BN(marketTokenDecimals))

  const tokenToGet = BN.min(
    new BN(tokenSupply).mul(marketTokenDecimalsMultiplier).div(collateralsPerToken),
    maxTokenToGet,
  )

  const adjustedTokenToGet = adjustAmountWithUpfrontFee(tokenToGet)

  return adjustedTokenToGet
}

export const getCurrentLoanInfo = (loan: core.TokenLoan) => {
  const currentLoanDebt = caclulateBorrowTokenLoanValue(loan).toNumber()
  const currentLoanBorrowedAmount = calculateTokenLoanValueWithUpfrontFee(loan).toNumber()
  const currentApr = loan.bondTradeTransaction.amountOfBonds

  return {
    currentLoanDebt,
    currentLoanBorrowedAmount,
    currentApr,
  }
}
