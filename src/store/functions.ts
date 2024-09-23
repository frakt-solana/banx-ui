import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { TICKER_TO_TOKEN, TOKEN_TICKER } from '@banx/utils'

import { AssetMode } from './common'

export const buildUrlWithModeAndToken = (
  pathname: string,
  mode: AssetMode,
  tokenType: LendingTokenType | null,
): string => {
  const urlParams = new URLSearchParams(window.location.search)

  urlParams.set('asset', mode)

  if (tokenType) {
    urlParams.set('token', TOKEN_TICKER[tokenType])
  }

  return `${pathname}?${urlParams.toString()}`
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
  const tokenTicker = params.get('token')

  if (tokenTicker && TICKER_TO_TOKEN[tokenTicker]) {
    return TICKER_TO_TOKEN[tokenTicker]
  }

  return assetMode === AssetMode.Token ? LendingTokenType.Usdc : LendingTokenType.BanxSol
}
