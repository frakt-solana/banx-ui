import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { produce } from 'immer'
import { create } from 'zustand'

import { fetchUserOffers } from '@banx/api/core'

interface HiddenOfferPubkeysState {
  pubkeys: string[]
  hideOffers: (...pubkeys: string[]) => void
}

const useHiddenOfferPubkeys = create<HiddenOfferPubkeysState>((set) => ({
  pubkeys: [],
  hideOffers: (...pubkeys) => {
    set(
      produce((state: HiddenOfferPubkeysState) => {
        state.pubkeys.push(...pubkeys)
      }),
    )
  },
}))

export const useUserOffers = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { pubkeys: hiddenOffersPubkeys, hideOffers } = useHiddenOfferPubkeys()

  const { data, isLoading } = useQuery(
    ['userOffers', publicKeyString],
    () => fetchUserOffers({ walletPublicKey: publicKeyString }),
    {
      enabled: !!publicKeyString,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  const offers = useMemo(() => {
    if (!data) {
      return []
    }

    return data.filter(({ publicKey }) => !hiddenOffersPubkeys.includes(publicKey))
  }, [data, hiddenOffersPubkeys])

  return {
    offers,
    loading: isLoading,
    hideOffers,
  }
}
