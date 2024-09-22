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
  return getUrlParam(params, 'asset') === AssetMode.NFT ? AssetMode.NFT : AssetMode.Token
}

export const getTokenTypeFromUrl = (
  params: URLSearchParams,
  assetMode: AssetMode,
): LendingTokenType => {
  const tokenFromUrl = params.get('token') as LendingTokenType | null

  if (tokenFromUrl) {
    return tokenFromUrl
  }

  return assetMode === AssetMode.Token ? LendingTokenType.Usdc : LendingTokenType.BanxSol
}

export const buildUrlWithMode = (pathname: string, mode: AssetMode): string => {
  const urlParams = new URLSearchParams(window.location.search)

  urlParams.set('asset', mode)

  return `${pathname}?${urlParams.toString()}`
}
