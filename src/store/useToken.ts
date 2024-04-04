import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { create } from 'zustand'

const BANX_TOKEN_LS_KEY = '@banx.tokenType'

interface TokenState {
  token: LendingTokenType
  setToken: (nextToken: LendingTokenType) => void
  toggleToken: () => void
}

export const useToken = create<TokenState>((set) => {
  const initialState: TokenState = {
    token:
      (localStorage.getItem(BANX_TOKEN_LS_KEY) as LendingTokenType) || LendingTokenType.NativeSol,
    setToken: (nextToken) => {
      localStorage.setItem(BANX_TOKEN_LS_KEY, nextToken)
      set((state) => ({ ...state, token: nextToken }))
    },
    toggleToken: () => {
      set((state) => {
        const nextToken =
          state.token === LendingTokenType.NativeSol
            ? LendingTokenType.Usdc
            : LendingTokenType.NativeSol
        localStorage.setItem(BANX_TOKEN_LS_KEY, nextToken)
        return { ...state, token: nextToken }
      })
    },
  }

  return initialState
})
