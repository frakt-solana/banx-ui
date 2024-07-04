import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { ModeType } from './common'

export const createPathWithModeParams = (
  pathname: string,
  mode: ModeType,
  tokenType: LendingTokenType | null,
) => {
  const modeQueryParam = mode === ModeType.Token ? `mode=${mode}` : ''

  const isDefaultTokenType = tokenType === LendingTokenType.BanxSol
  const tokenQueryParam = tokenType && !isDefaultTokenType ? `token=${tokenType}` : ''

  const queryParams = [modeQueryParam, tokenQueryParam].filter(Boolean).join('&')
  const queryString = queryParams ? `?${queryParams}` : ''

  return `${pathname}${queryString}`
}
