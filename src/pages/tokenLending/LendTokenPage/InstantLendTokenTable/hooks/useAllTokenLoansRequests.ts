import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { produce } from 'immer'
import { create } from 'zustand'

import { TokenLoan } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'

import { MOCK_RESPONSE } from './mockResponse'

interface HiddenCollateralMintsState {
  mints: string[]
  addMints: (mints: string[]) => void
}

const useHiddenCollateralMint = create<HiddenCollateralMintsState>((set) => ({
  mints: [],
  addMints: (mints) => {
    set(
      produce((state: HiddenCollateralMintsState) => {
        state.mints = mints.map((nft) => nft)
      }),
    )
  },
}))

export const useAllTokenLoansRequests = () => {
  const { mints, addMints } = useHiddenCollateralMint()
  const { tokenType } = useNftTokenType()

  const { data, isLoading } = useQuery(
    ['allTokenLoansRequests', tokenType],
    () => Promise.resolve(MOCK_RESPONSE),
    {
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  const loans = useMemo(() => {
    if (!data) return []

    const combinedLoans = [...data.auctions, ...data.listings]
    return combinedLoans.filter(({ collateral }) => !mints.includes(collateral.mint))
  }, [data, mints])

  return {
    loans: loans as TokenLoan[],
    isLoading,
    addMints,
  }
}
