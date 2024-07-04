import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { create } from 'zustand'

import { isBanxSolTokenType } from '@banx/utils'

import { ModeType } from '../common'
import { createPathWithModeParams } from '../functions'

type TokenTypeState = {
  tokenType: LendingTokenType
  setTokenType: (nextToken: LendingTokenType) => void
}

export const useNftTokenTypeState = create<TokenTypeState>((set) => ({
  tokenType: LendingTokenType.BanxSol,
  setTokenType: (tokenType: LendingTokenType) => set((state) => ({ ...state, tokenType })),
}))

export const useNftTokenType = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)

  const tokenTypeFromUrl = params.get('token') as LendingTokenType
  const modeTypeFromUrl = params.get('mode') as ModeType

  const { tokenType, setTokenType: setTokenTypeState } = useNftTokenTypeState((state) => {
    try {
      const tokenType = tokenTypeFromUrl || LendingTokenType.BanxSol

      z.nativeEnum(LendingTokenType).parse(tokenType)

      return { ...state, tokenType }
    } catch (error) {
      console.error('Error getting token type from URL')

      return { ...state, tokenType: LendingTokenType.BanxSol }
    }
  })

  const setTokenType = (tokenType: LendingTokenType) => {
    const modeType = modeTypeFromUrl || ModeType.NFT

    setTokenTypeState(tokenType)
    navigate(createPathWithModeParams(location.pathname, modeType, tokenType))
  }

  return { tokenType, setTokenType }
}

export const createPathWithTokenParam = (pathname: string, tokenType: LendingTokenType) => {
  if (isBanxSolTokenType(tokenType)) return pathname

  return `${pathname}?token=${tokenType}`
}
