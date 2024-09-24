import { useEffect } from 'react'

import { useLocation, useNavigate } from 'react-router-dom'
import { create } from 'zustand'

import { buildUrlWithModeAndToken, getAssetModeFromUrl } from '../functions'

export enum AssetMode {
  NFT = 'nft',
  Token = 'token',
}

interface ModeContext {
  currentAssetMode: AssetMode
  setAssetMode: (newMode: AssetMode) => void
}

const useAssetModeState = create<ModeContext>((set) => ({
  currentAssetMode: AssetMode.Token,
  setAssetMode: (newMode) => set({ currentAssetMode: newMode }),
}))

export const useAssetMode = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const urlParams = new URLSearchParams(location.search)

  const assetModeFromUrl = getAssetModeFromUrl(urlParams)

  const { currentAssetMode, setAssetMode } = useAssetModeState()

  useEffect(() => {
    if (currentAssetMode !== assetModeFromUrl) {
      setAssetMode(assetModeFromUrl)
    }
  }, [assetModeFromUrl, currentAssetMode, setAssetMode])

  const changeAssetMode = (newMode: AssetMode) => {
    if (newMode !== currentAssetMode) {
      const updatedUrl = buildUrlWithModeAndToken(location.pathname, newMode, null)
      setAssetMode(newMode)
      navigate(updatedUrl, { replace: true })
    }
  }

  return { currentAssetMode, changeAssetMode }
}
