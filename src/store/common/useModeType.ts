import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { create } from 'zustand'

import { PATHS } from '@banx/router'
import { isSolTokenType } from '@banx/utils'

export enum ModeType {
  NFT = 'nft',
  Token = 'token',
}

interface ModeState {
  modeType: ModeType
  setModeType: (nextValue: ModeType) => void
}

export const useModeState = create<ModeState>((set) => ({
  modeType: ModeType.NFT,
  setModeType: (nextValue) => set((state) => ({ ...state, modeType: nextValue })),
}))

export const useModeType = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)

  const modeTypeFromUrl = params.get('mode') as ModeType

  const { modeType, setModeType: setModeTypeState } = useModeState((state) => {
    try {
      const modeType = modeTypeFromUrl || ModeType.NFT

      z.nativeEnum(ModeType).parse(modeType)

      return { ...state, modeType }
    } catch (error) {
      console.error('Error getting mode type from URL')

      return { ...state, modeType: ModeType.NFT }
    }
  })

  const setModeType = (mode: ModeType) => {
    setModeTypeState(mode)
    navigate(createPathWithParams(PATHS.ROOT, mode))
  }

  return { modeType, setModeType }
}

export const createPathWithParams = (
  pathname: string,
  mode: ModeType,
  tokenType: LendingTokenType = LendingTokenType.NativeSol,
) => {
  const modeTypePath = mode === ModeType.Token ? `?mode=${mode}` : ''
  const tokenTypePath = !isSolTokenType(tokenType) ? `?token=${tokenType}` : ''

  return `${pathname}${modeTypePath}${tokenTypePath}`
}
