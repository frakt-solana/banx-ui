import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { create } from 'zustand'

import { ModeType } from '../common'
import { createPathWithModeParams } from '../functions'

export enum TokenType {
  SOL = 'sol',
  USDC = 'usdc',
  ALL = 'all',
}

type TokenTypeState = {
  tokenType: TokenType
  setTokenType: (nextToken: TokenType) => void
}

export const useTokenTypeState = create<TokenTypeState>((set) => ({
  tokenType: TokenType.SOL,
  setTokenType: (tokenType: TokenType) => set((state) => ({ ...state, tokenType })),
}))

export const useTokenType = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)

  const tokenTypeFromUrl = params.get('token') as TokenType

  const { tokenType, setTokenType: setTokenTypeState } = useTokenTypeState((state) => {
    try {
      const tokenType = tokenTypeFromUrl || TokenType.SOL

      // //? Check URL data validity
      z.nativeEnum(TokenType).parse(tokenType)

      return { ...state, tokenType }
    } catch (error) {
      console.error('Error getting token type from URL')

      return { ...state, tokenType: TokenType.SOL }
    }
  })

  const setTokenType = (tokenType: TokenType) => {
    setTokenTypeState(tokenType)
    navigate(createPathWithModeParams(location.pathname, ModeType.Token, tokenType))
  }

  return { tokenType, setTokenType }
}
