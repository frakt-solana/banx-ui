import { calculatePlayerPointsForTokens } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'

import { BANX_TOKEN_DECIMALS } from '@banx/constants'
import { stringToBN } from '@banx/utils'

export const calcPlayerPoints = (value: string) => {
  const tokensToStakeBN = formatBanxTokensStrToBN(value)
  const playerPoints = calculatePlayerPointsForTokens(tokensToStakeBN)

  return playerPoints
}

export const calcIdleBalance = (balance: number, inputTokenAmount: string) => {
  const parsedInputTokenAmount = parseFloat(inputTokenAmount || '0')
  return Math.max(balance - parsedInputTokenAmount, 0)
}

export const formatBanxTokensStrToBN = (value: string) => {
  return stringToBN(value, BANX_TOKEN_DECIMALS)
}
