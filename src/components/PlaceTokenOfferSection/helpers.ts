import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { chain } from 'lodash'

type GetErrorMessage = (props: {
  walletBalance: number
  syntheticOffer: any
  offerSize: number
  collateralsPerToken: number
  tokenType: LendingTokenType
}) => string

export const getErrorMessage: GetErrorMessage = ({
  walletBalance,
  syntheticOffer,
  offerSize,
  collateralsPerToken,
  tokenType,
}) => {
  const totalFundsAvailable = syntheticOffer.loanValue + walletBalance

  const isOfferInvalid = collateralsPerToken > offerSize
  const isBalanceInsufficient = offerSize > totalFundsAvailable

  const errorConditions: Array<[boolean, string]> = [
    [isBalanceInsufficient, createInsufficientBalanceErrorMessage(tokenType)],
    [isOfferInvalid, 'Size should be more than collaterals per token'],
  ]

  const errorMessage = chain(errorConditions)
    .find(([condition]) => condition)
    .thru((error) => (error ? error[1] : ''))
    .value() as string

  return errorMessage
}

const createInsufficientBalanceErrorMessage = (tokenType: LendingTokenType) => {
  return `Not enough ${tokenType} in wallet`
}
