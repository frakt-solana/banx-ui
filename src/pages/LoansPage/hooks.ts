import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { produce } from 'immer'
import { uniqBy } from 'lodash'
import { create } from 'zustand'

import { Loan, fetchWalletLoans } from '@banx/api/core'
import { useOptimisticLoans } from '@banx/store'
import { calcLoanValueWitProtocolFee } from '@banx/utils'

type UseWalletLoans = () => {
  loans: Loan[]
  isLoading: boolean
  hideLoans: (publicKey: string[]) => void
}

export const useWalletLoans: UseWalletLoans = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { hideLoans, hiddenLoansPubkeys } = useHiddenNFTsMint()
  const { loans: optimisticLoans } = useOptimisticLoans()

  const { data, isLoading } = useQuery(
    ['walletLoans', publicKeyString],
    () => fetchWalletLoans({ walletPublicKey: publicKeyString }),
    {
      enabled: !!publicKeyString,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  const loansWithOptimistics = useMemo(() => {
    if (!data) {
      return []
    }
    return uniqBy([...data, ...optimisticLoans], ({ publicKey }) => publicKey).map((loan) => ({
      ...loan,
      fraktBond: {
        ...loan.fraktBond,
        borrowedAmount: calcLoanValueWitProtocolFee(loan.fraktBond.borrowedAmount),
      },
    }))
  }, [data, optimisticLoans])

  const loans = useMemo(() => {
    return loansWithOptimistics.filter(({ publicKey }) => !hiddenLoansPubkeys.includes(publicKey))
  }, [loansWithOptimistics, hiddenLoansPubkeys])

  return {
    loans,
    isLoading,
    hideLoans,
  }
}

interface HiddenLoansPubkeysState {
  hiddenLoansPubkeys: string[]
  hideLoans: (publicKeys: string[]) => void
}

const useHiddenNFTsMint = create<HiddenLoansPubkeysState>((set) => ({
  hiddenLoansPubkeys: [],
  hideLoans: (publicKeys: string[]) =>
    set(
      produce((state: HiddenLoansPubkeysState) => {
        state.hiddenLoansPubkeys.push(...publicKeys)
      }),
    ),
}))
