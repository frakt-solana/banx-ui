import { create } from 'zustand'

export enum TokenType {
  USDC = 'usdc',
  SOL = 'sol',
}

const BANX_TOKEN_LS_KEY = '@banx.tokenType'

interface TokenState {
  token: TokenType
  setToken: (nextToken: TokenType) => void
  toggleToken: () => void
}

export const useToken = create<TokenState>((set) => {
  const initialState: TokenState = {
    token: (localStorage.getItem(BANX_TOKEN_LS_KEY) as TokenType) || TokenType.SOL,
    setToken: (nextToken) => {
      localStorage.setItem(BANX_TOKEN_LS_KEY, nextToken)
      set((state) => ({ ...state, token: nextToken }))
    },
    toggleToken: () => {
      set((state) => {
        const nextToken = state.token === TokenType.SOL ? TokenType.USDC : TokenType.SOL
        localStorage.setItem(BANX_TOKEN_LS_KEY, nextToken)
        return { ...state, token: nextToken }
      })
    },
  }

  return initialState
})
