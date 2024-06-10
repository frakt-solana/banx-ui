import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { create } from 'zustand'

import { useNftTokenType } from '@banx/store/nft'

import { LoansTokenTabsName } from './LoansTokenPage'
import { MOCK_RESPONSE } from './mockResponse'

export const USE_WALLET_TOKEN_LOANS_AND_OFFERS_QUERY_KEY = 'walletTokenLoansAndOffers'

export const useWalletTokenLoansAndOffers = () => {
  const { publicKey: walletPublicKey } = useWallet()
  const publicKeyString = walletPublicKey?.toBase58() || ''

  const { tokenType } = useNftTokenType()

  const { data, isLoading } = useQuery(
    [USE_WALLET_TOKEN_LOANS_AND_OFFERS_QUERY_KEY, publicKeyString, tokenType],
    () => Promise.resolve(MOCK_RESPONSE),
    {
      enabled: !!publicKeyString,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 5 * 60 * 1000, //? 5 minutes
    },
  )

  return {
    loans: data?.loans || ([] as any[]),
    offers: data?.offers || {},
    isLoading,
  }
}

type LoansTokenTabsState = {
  tab: LoansTokenTabsName | null
  setTab: (tab: LoansTokenTabsName | null) => void
}

export const useLoansTokenTabs = create<LoansTokenTabsState>((set) => ({
  tab: null,
  setTab: (tab) => set({ tab }),
}))
