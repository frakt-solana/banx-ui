import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { create } from 'zustand'

import { ModeType } from '../common'
import { createPathWithModeParams } from '../functions'

type TokenTypeState = {
  tokenType: LendingTokenType
  setTokenType: (nextToken: LendingTokenType) => void
}

export const useNftTokenTypeState = create<TokenTypeState>((set) => ({
  tokenType: LendingTokenType.NativeSol,
  setTokenType: (tokenType: LendingTokenType) => set((state) => ({ ...state, tokenType })),
}))

export const useNftTokenType = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)

  const tokenTypeFromUrl = params.get('token') as LendingTokenType

  const { tokenType, setTokenType: setTokenTypeState } = useNftTokenTypeState((state) => {
    try {
      const tokenType = tokenTypeFromUrl || LendingTokenType.NativeSol

      //? Check URL data validity
      z.nativeEnum(LendingTokenType).parse(tokenType)

      return { ...state, tokenType }
    } catch (error) {
      console.error('Error getting token type from URL')

      return { ...state, tokenType: LendingTokenType.NativeSol }
    }
  })

  const setTokenType = (tokenType: LendingTokenType) => {
    setTokenTypeState(tokenType)
    navigate(createPathWithModeParams(location.pathname, ModeType.NFT, tokenType))
  }

  return { tokenType, setTokenType }
}
