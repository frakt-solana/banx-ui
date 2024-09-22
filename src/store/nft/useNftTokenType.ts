import { useEffect } from 'react'

import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { useLocation, useNavigate } from 'react-router-dom'
import { create } from 'zustand'

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
  const modeTypeFromUrl = (params.get('asset') as ModeType) || ModeType.NFT

  const { tokenType, setTokenType: setTokenTypeState } = useNftTokenTypeState((state) => state)

  const modeType = modeTypeFromUrl || ModeType.NFT

  useEffect(() => {
    const tokenToSet = tokenTypeFromUrl || LendingTokenType.BanxSol
    if (tokenType !== tokenToSet) {
      setTokenTypeState(tokenToSet)
    }
  }, [tokenTypeFromUrl, tokenType, setTokenTypeState])

  const setTokenType = (newTokenType: LendingTokenType) => {
    if (newTokenType !== tokenType) {
      setTokenTypeState(newTokenType)
      navigate(createPathWithModeParams(location.pathname, modeType, newTokenType)) // Обновляем URL
    }
  }

  return { tokenType, setTokenType }
}
