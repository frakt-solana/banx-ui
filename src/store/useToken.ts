import { create } from 'zustand'

export enum TokenType {
  USDC = 'usdc',
  SOL = 'sol',
}

interface TokenState {
  token: TokenType
  setToken: (nextToken: TokenType) => void
  toggleToken: () => void
}

export const useToken = create<TokenState>((set) => {
  const initialState: TokenState = {
    token: TokenType.SOL,
    setToken: (nextToken) => set((state) => ({ ...state, token: nextToken })),
    toggleToken: () =>
      set((state) => ({
        ...state,
        token: state.token === TokenType.SOL ? TokenType.USDC : TokenType.SOL,
      })),
  }

  return initialState
})
