import { useQuery } from '@tanstack/react-query'
import { produce } from 'immer'
import { create } from 'zustand'

import { Loan, fetchWalletLoans } from '@banx/api/loans'

type UseWalletLoans = (walletPublicKey: string) => {
  loans: Loan[]
  isLoading: boolean
  hideLoan: (publicKey: string) => void
}

export const useWalletLoans: UseWalletLoans = (walletPublicKey) => {
  const { hideLoan, hiddenLoansPubkeys } = useHiddenNFTsMint()

  const { data, isLoading } = useQuery(
    ['walletLoans', walletPublicKey],
    () => fetchWalletLoans({ walletPublicKey }),
    {
      enabled: !!walletPublicKey,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  return {
    loans: data?.filter(({ publicKey }) => !hiddenLoansPubkeys.includes(publicKey)) || [],
    isLoading,
    hideLoan,
  }
}

interface HiddenLoansPubkeysState {
  hiddenLoansPubkeys: string[]
  hideLoan: (publicKey: string) => void
}
const useHiddenNFTsMint = create<HiddenLoansPubkeysState>((set) => ({
  hiddenLoansPubkeys: [],
  hideLoan: (publicKey: string) =>
    set(
      produce((state: HiddenLoansPubkeysState) => {
        state.hiddenLoansPubkeys = [...state.hiddenLoansPubkeys, publicKey]
      }),
    ),
}))
