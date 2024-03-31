import { calculatePlayerPointsForTokens } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'

import { stringToBN } from '@banx/utils'

export const calcPlayerPoints = (value: string) => {
  const tokensToStakeBN = stringToBN(value)
  const playerPoints = calculatePlayerPointsForTokens(tokensToStakeBN)

  return playerPoints
}

export const calcIdleBalance = (balance: number, inputTokenAmount: string) => {
  const parsedInputTokenAmount = parseFloat(inputTokenAmount || '0')
  return Math.max(balance - parsedInputTokenAmount, 0)
}

export const limitDecimalPlaces = (inputValue: string, decimalPlaces = 3) => {
  const regex = new RegExp(`^-?\\d*(\\.\\d{0,${decimalPlaces}})?`)
  const match = inputValue.match(regex)
  return match ? match[0] : ''
}
