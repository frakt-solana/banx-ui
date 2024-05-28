import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { create } from 'zustand'

import { PATHS } from '@banx/router'

import { createPathWithModeParams } from '../functions'

export enum ModeType {
  NFT = 'nft',
  Token = 'token',
}

interface ModeState {
  modeType: ModeType
  setModeType: (nextValue: ModeType) => void
}

const useModeState = create<ModeState>((set) => ({
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
    navigate(createPathWithModeParams(PATHS.ROOT, mode, null))
  }

  return { modeType, setModeType }
}
