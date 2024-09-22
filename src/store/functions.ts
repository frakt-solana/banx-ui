import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { ModeType } from './common'

export const createPathWithModeParams = (
  pathname: string,
  mode: ModeType,
  tokenType?: LendingTokenType,
) => {
  const params = new URLSearchParams()

  params.set('asset', mode === ModeType.Token ? 'token' : 'nft')

  if (tokenType) {
    params.set('token', tokenType)
  }

  const queryString = params.toString() ? `?${params.toString()}` : ''

  return `${pathname}${queryString}`
}
