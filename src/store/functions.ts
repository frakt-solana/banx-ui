import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { ModeType } from './common'
import { TokenType } from './token/useTokenType'

export const createPathWithParams = (
  pathname: string,
  mode: ModeType,
  tokenType: LendingTokenType | TokenType | null,
) => {
  const isDefaultTokenType = tokenType === TokenType.SOL || tokenType === LendingTokenType.NativeSol

  const modeQueryParam = mode === ModeType.Token ? `mode=${mode}` : ''

  const tokenQueryParam = tokenType && !isDefaultTokenType ? `token=${tokenType}` : ''

  const queryParams = [modeQueryParam, tokenQueryParam].filter(Boolean).join('&')
  const queryString = queryParams ? `?${queryParams}` : ''

  return `${pathname}${queryString}`
}
