import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { chain } from 'lodash'

import { SyntheticTokenOffer } from '@banx/store/token'

type GetErrorMessage = (props: {
  walletBalance: number
  syntheticOffer: SyntheticTokenOffer
  offerSize: number
  tokenType: LendingTokenType
}) => string

export const getErrorMessage: GetErrorMessage = ({
  walletBalance,
  syntheticOffer,
  offerSize,
  tokenType,
}) => {
  const totalFundsAvailable = syntheticOffer.offerSize + walletBalance

  const isBalanceInsufficient = offerSize > totalFundsAvailable

  const errorConditions: Array<[boolean, string]> = [
    [isBalanceInsufficient, createInsufficientBalanceErrorMessage(tokenType)],
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
