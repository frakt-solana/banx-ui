import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { create } from 'zustand'

import { PATHS } from '@banx/router'

import { createPathWithModeParams } from '../functions'

export enum ModeType {
  NFT = 'nft',
  Token = 'token',
}

const MODE_ROUTE_MAP = {
  [ModeType.NFT]: {
    [PATHS.BORROW_TOKEN]: PATHS.BORROW,
    [PATHS.LEND_TOKEN]: PATHS.LEND,
    [PATHS.LOANS_TOKEN]: PATHS.LOANS,
    [PATHS.OFFERS_TOKEN]: PATHS.OFFERS,
  },
  [ModeType.Token]: {
    [PATHS.BORROW]: PATHS.BORROW_TOKEN,
    [PATHS.LEND]: PATHS.LEND_TOKEN,
    [PATHS.LOANS]: PATHS.LOANS_TOKEN,
    [PATHS.OFFERS]: PATHS.OFFERS_TOKEN,
  },
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

  const modeTypeFromUrl = params.get('mode') as ModeType
  const tokenTypeFromUrl = params.get('token') as LendingTokenType

  const { modeType, setModeType: setModeTypeState } = useModeState((state) => {
    try {
      const modeType = modeTypeFromUrl || ModeType.Token

      z.nativeEnum(ModeType).parse(modeType)

      return { ...state, modeType }
    } catch (error) {
      console.error('Error getting mode type from URL')

      return { ...state, modeType: ModeType.Token }
    }
  })

  const setModeType = (mode: ModeType) => {
    const newPath = getRouteForMode(location.pathname, mode)
    const tokenType = tokenTypeFromUrl || LendingTokenType.BanxSol

    setModeTypeState(mode)
    navigate(createPathWithModeParams(newPath, mode, tokenType))
  }

  return { modeType, setModeType }
}

export const getRouteForMode = (currentPath: string, nextMode: ModeType): string => {
  return MODE_ROUTE_MAP[nextMode][currentPath] || currentPath
}
