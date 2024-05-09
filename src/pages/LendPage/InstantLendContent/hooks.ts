import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { produce } from 'immer'
import { create } from 'zustand'

import { fetchAllLoansRequests } from '@banx/api/core'
import { useTokenType } from '@banx/store'

interface HiddenNftsMintsState {
  mints: string[]
  addMints: (mints: string[]) => void
}

const useHiddenNftsMint = create<HiddenNftsMintsState>((set) => ({
  mints: [],
  addMints: (mints) => {
    set(
      produce((state: HiddenNftsMintsState) => {
        state.mints = mints.map((nft) => nft)
      }),
    )
  },
}))

export const useAllLoansRequests = () => {
  const { mints, addMints } = useHiddenNftsMint()
  const { tokenType } = useTokenType()

  const { data, isLoading } = useQuery(
    ['allLoansRequests', tokenType],
    () => fetchAllLoansRequests({ tokenType }),
    {
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  const loans = useMemo(() => {
    if (!data) return []

    const combinedLoans = [...data.auctions, ...data.listings]
    return combinedLoans.filter(({ nft }) => !mints.includes(nft.mint))
  }, [data, mints])

  return {
    loans,
    isLoading,
    addMints,
  }
}
