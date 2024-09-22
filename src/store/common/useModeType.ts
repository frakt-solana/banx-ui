import { useEffect } from 'react'

import { useLocation, useNavigate } from 'react-router-dom'
import { create } from 'zustand'

export enum ModeType {
  NFT = 'nft',
  Token = 'token',
}

interface ModeState {
  modeType: ModeType
  setModeType: (nextValue: ModeType) => void
}

const useModeState = create<ModeState>((set) => ({
  modeType: ModeType.Token,
  setModeType: (nextValue) => set((state) => ({ ...state, modeType: nextValue })),
}))

export const useModeType = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const { modeType, setModeType: setModeTypeState } = useModeState((state) => state)

  const modeTypeFromUrl = params.get('asset') === 'token' ? ModeType.Token : ModeType.NFT

  useEffect(() => {
    if (modeType !== modeTypeFromUrl) {
      setModeTypeState(modeTypeFromUrl)
    }
  }, [modeTypeFromUrl, modeType, setModeTypeState])

  const setModeType = (mode: ModeType) => {
    const newPath = getRouteForMode(location.pathname, mode)

    setModeTypeState(mode)
    navigate(newPath, { replace: true })
  }

  return { modeType, setModeType }
}

export const getRouteForMode = (currentPath: string, nextMode: ModeType): string => {
  const params = new URLSearchParams(window.location.search)

  params.set('asset', nextMode === ModeType.Token ? 'token' : 'nft')

  const queryString = params.toString() ? `?${params.toString()}` : ''

  return `${currentPath}${queryString}`
}
