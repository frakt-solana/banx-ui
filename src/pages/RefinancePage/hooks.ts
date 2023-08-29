import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { produce } from 'immer'
import { create } from 'zustand'

import { fetchAuctionsLoans } from '@banx/api/core'

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

  const { data, isLoading } = useQuery(['auctionsLoans'], () => fetchAuctionsLoans(), {
    staleTime: 5 * 1000,
    refetchOnWindowFocus: false,
    refetchInterval: 15 * 1000,
  })

  const loans = useMemo(() => {
    if (!data?.length) {
      return []
    }

    return data.filter(({ publicKey }) => !mints.includes(publicKey))
  }, [data, mints])

  return {
    loans,
    isLoading,
    addMints,
  }
}
