import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { create } from 'zustand'

const BANX_TOKEN_LS_KEY = '@banx.tokenType'

interface TokenTypeState {
  tokenType: LendingTokenType
  setTokenType: (nextToken: LendingTokenType) => void
  toggleTokenType: () => void
}

export const useTokenType = create<TokenTypeState>((set) => {
  const initialState: TokenTypeState = {
    tokenType:
      (localStorage.getItem(BANX_TOKEN_LS_KEY) as LendingTokenType) || LendingTokenType.NativeSol,
    setTokenType: (nextToken) => {
      localStorage.setItem(BANX_TOKEN_LS_KEY, nextToken)
      set((state) => ({ ...state, tokenType: nextToken }))
    },
    toggleTokenType: () => {
      set((state) => {
        const nextToken =
          state.tokenType === LendingTokenType.NativeSol
            ? LendingTokenType.Usdc
            : LendingTokenType.NativeSol
        localStorage.setItem(BANX_TOKEN_LS_KEY, nextToken)
        return { ...state, token: nextToken }
      })
    },
  }

  return initialState
})
