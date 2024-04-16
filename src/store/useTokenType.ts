import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'
import { create } from 'zustand'

const BANX_TOKEN_LS_KEY = '@banx.tokenType'

type TokenTypeState = {
  tokenType: LendingTokenType
  setTokenType: (nextToken: LendingTokenType) => void
}

export const useTokenTypeState = create<TokenTypeState>((set) => ({
  tokenType: LendingTokenType.NativeSol,
  setTokenType: (tokenType: LendingTokenType) => set((state) => ({ ...state, tokenType })),
}))

export const useTokenType = () => {
  const { tokenType, setTokenType: setTokenTypeState } = useTokenTypeState((state) => {
    try {
      const tokenTypeJSON = localStorage.getItem(BANX_TOKEN_LS_KEY)
      const tokenType = tokenTypeJSON
        ? (JSON.parse(tokenTypeJSON) as LendingTokenType)
        : LendingTokenType.NativeSol

      //? Check LS data validity
      z.nativeEnum(LendingTokenType).parse(tokenType)

      return { ...state, tokenType }
    } catch (error) {
      console.error('Error getting token type from LS')
      localStorage.removeItem(BANX_TOKEN_LS_KEY)

      return { ...state, tokenType: LendingTokenType.NativeSol }
    }
  })

  const setTokenType = (tokenType: LendingTokenType) => {
    try {
      setTokenTypeState(tokenType)
      localStorage.setItem(BANX_TOKEN_LS_KEY, JSON.stringify(tokenType))
    } catch (error) {
      console.error(error)
    }
  }

  return { tokenType, setTokenType }
}
