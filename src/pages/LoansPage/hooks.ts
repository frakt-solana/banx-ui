import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { produce } from 'immer'
import { create } from 'zustand'

import { Loan, fetchWalletLoans } from '@banx/api/core'

type UseWalletLoans = () => {
  loans: Loan[]
  isLoading: boolean
  hideLoan: (publicKey: string[]) => void
}

export const useWalletLoans: UseWalletLoans = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { hideLoan, hiddenLoansPubkeys } = useHiddenNFTsMint()

  const { data, isLoading } = useQuery(
    ['walletLoans', publicKeyString],
    () => fetchWalletLoans({ walletPublicKey: publicKeyString }),
    {
      enabled: !!publicKey,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  const loans = useMemo(() => {
    if (!data) {
      return []
    }
    return data.filter(({ publicKey }) => !hiddenLoansPubkeys.includes(publicKey))
  }, [data, hiddenLoansPubkeys])

  return {
    loans,
    isLoading,
    hideLoan,
  }
}

interface HiddenLoansPubkeysState {
  hiddenLoansPubkeys: string[]
  hideLoan: (publicKeys: string[]) => void
}

const useHiddenNFTsMint = create<HiddenLoansPubkeysState>((set) => ({
  hiddenLoansPubkeys: [],
  hideLoan: (publicKeys: string[]) =>
    set(
      produce((state: HiddenLoansPubkeysState) => {
        state.hiddenLoansPubkeys.push(...publicKeys)
      }),
    ),
}))
