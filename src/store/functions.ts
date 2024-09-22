import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { AssetMode } from './common'

export const buildUrlWithModeAndToken = (
  pathname: string,
  mode: AssetMode,
  tokenType?: LendingTokenType,
): string => {
  const urlParams = new URLSearchParams(window.location.search)

  urlParams.set('asset', mode)

  if (tokenType) {
    urlParams.set('token', tokenType)
  }

  const queryString = urlParams.toString() ? `?${urlParams.toString()}` : ''

  return `${pathname}${queryString}`
}

const getUrlParam = (params: URLSearchParams, key: string): string | null => {
  return params.get(key)
}

export const getAssetModeFromUrl = (params: URLSearchParams): AssetMode => {
  return getUrlParam(params, 'asset') === AssetMode.Token ? AssetMode.Token : AssetMode.NFT
}

export const getTokenTypeFromUrl = (params: URLSearchParams): LendingTokenType => {
  return getUrlParam(params, 'token') === LendingTokenType.BanxSol
    ? LendingTokenType.BanxSol
    : LendingTokenType.Usdc
}

export const buildUrlWithMode = (pathname: string, mode: AssetMode): string => {
  const urlParams = new URLSearchParams(window.location.search)

  urlParams.set('asset', mode)

  return `${pathname}?${urlParams.toString()}`
}
