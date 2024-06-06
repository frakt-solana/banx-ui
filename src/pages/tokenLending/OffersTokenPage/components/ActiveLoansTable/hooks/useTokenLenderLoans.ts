import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import produce from 'immer'
import { create } from 'zustand'

import { core } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'

import { MOCK_RESPONSE } from '../mockResponse'

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

export const useTokenLenderLoans = () => {
  const { mints, addMints } = useHiddenCollateralMint()
  const { tokenType } = useNftTokenType()

  const { data, isLoading } = useQuery(
    ['tokenLenderLoans', tokenType],
    () => Promise.resolve(MOCK_RESPONSE),
    {
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  const loans = useMemo(() => {
    if (!data) return []

    return data.filter(({ collateral }) => !mints.includes(collateral.mint))
  }, [data, mints])

  const updateOrAddLoan = (loan: core.TokenLoan) => {
    return loan
  }

  return {
    loans: loans as core.TokenLoan[],
    loading: isLoading,
    addMints,

    updateOrAddLoan,
  }
}
