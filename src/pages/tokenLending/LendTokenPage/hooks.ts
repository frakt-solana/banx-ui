import { useQuery } from '@tanstack/react-query'
import { create } from 'zustand'

import { core } from '@banx/api/tokens'
import { useTokenType } from '@banx/store/token'

import { LendTokenTabName } from './LendTokenPage'

export const USE_TOKEN_MARKETS_PREVIEW_QUERY_KEY = 'tokenMarketsPreview'

export const useTokenMarketsPreview = () => {
  const { tokenType } = useTokenType()

  const { data, isLoading } = useQuery(
    [USE_TOKEN_MARKETS_PREVIEW_QUERY_KEY, tokenType],
    () => core.fetchTokenMarketsPreview({ tokenType }),
    {
      staleTime: 5000,
      cacheTime: Infinity,
      refetchOnWindowFocus: false,
    },
  )

  return {
    marketsPreview: data || [],
    isLoading,
  }
}

type LendTokenTabsState = {
  tab: LendTokenTabName | null
  setTab: (tab: LendTokenTabName | null) => void
}

export const useLendTokenTabs = create<LendTokenTabsState>((set) => ({
  tab: null,
  setTab: (tab) => set({ tab }),
}))
