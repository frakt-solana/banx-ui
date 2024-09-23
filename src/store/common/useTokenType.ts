import { useEffect } from 'react'

import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { useLocation, useNavigate } from 'react-router-dom'
import { create } from 'zustand'

import { buildUrlWithModeAndToken, getAssetModeFromUrl, getTokenTypeFromUrl } from '../functions'

type TokenTypeContext = {
  currentTokenType: LendingTokenType
  setTokenType: (newTokenType: LendingTokenType) => void
}

export const useTokenTypeState = create<TokenTypeContext>((set) => ({
  currentTokenType: LendingTokenType.BanxSol,
  setTokenType: (newTokenType) => set({ currentTokenType: newTokenType }),
}))

export const useTokenType = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const urlParams = new URLSearchParams(location.search)

  const assetModeFromUrl = getAssetModeFromUrl(urlParams)
  const tokenTypeFromUrl = getTokenTypeFromUrl(urlParams, assetModeFromUrl)

  const { currentTokenType, setTokenType } = useTokenTypeState()

  useEffect(() => {
    if (currentTokenType !== tokenTypeFromUrl) {
      setTokenType(tokenTypeFromUrl)
    }
  }, [tokenTypeFromUrl, currentTokenType, setTokenType])

  const changeTokenType = (newTokenType: LendingTokenType) => {
    if (newTokenType !== currentTokenType) {
      const updatedUrl = buildUrlWithModeAndToken(location.pathname, assetModeFromUrl, newTokenType)
      setTokenType(newTokenType)
      navigate(updatedUrl, { replace: true })
    }
  }

  return { tokenType: currentTokenType, setTokenType: changeTokenType }
}
