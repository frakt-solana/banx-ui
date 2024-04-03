import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { produce } from 'immer'
import { create } from 'zustand'

import { fetchAuctionsLoans } from '@banx/api/core'
import { useToken } from '@banx/store'

interface HiddenNFTsMintsState {
  mints: string[]
  addMints: (...mints: string[]) => void
}

const useHiddenNFTsMint = create<HiddenNFTsMintsState>((set) => ({
  mints: [],
  addMints: (...mints) => {
    set(
      produce((state: HiddenNFTsMintsState) => {
        state.mints.push(...mints)
      }),
    )
  },
}))

export const useAuctionsLoans = () => {
  const { mints, addMints } = useHiddenNFTsMint()
  const { token: tokenType } = useToken()

  const { data, isLoading } = useQuery(
    ['auctionsLoans', tokenType],
    () => fetchAuctionsLoans({ marketType: tokenType }),
    {
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  const loans = useMemo(() => {
    if (!data?.length) {
      return []
    }

    return data.filter(({ nft }) => !mints.includes(nft.mint))
  }, [data, mints])

  return {
    loans,
    isLoading,
    addMints,
  }
}
