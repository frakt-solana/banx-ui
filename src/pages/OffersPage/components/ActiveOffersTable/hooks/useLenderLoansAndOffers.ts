import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { produce } from 'immer'
import { create } from 'zustand'

import { Offer, fetchLenderLoansAndOffers } from '@banx/api/core'
import { useOffersOptimistic } from '@banx/store'

interface HiddenNftsMintsState {
  mints: string[]
  addMints: (...mints: string[]) => void
}

const useHiddenNftsMints = create<HiddenNftsMintsState>((set) => ({
  mints: [],
  addMints: (...mints) => {
    set(
      produce((state: HiddenNftsMintsState) => {
        state.mints.push(...mints)
      }),
    )
  },
}))

export const useLenderLoansAndOffers = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { offers: optimisticOffers, findOffer, updateOffer, addOffer } = useOffersOptimistic()
  const { mints, addMints } = useHiddenNftsMints()

  const { data, isLoading } = useQuery(
    ['lenderLoans', publicKeyString],
    () => fetchLenderLoansAndOffers({ walletPublicKey: publicKeyString }),
    {
      enabled: !!publicKeyString,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  const loans = useMemo(() => {
    if (!data?.nfts) {
      return []
    }

    return data.nfts.filter(({ nft }) => !mints.includes(nft.mint))
  }, [data, mints])

  const updateOrAddOffer = (offer: Offer) => {
    const offerExists = !!findOffer(offer.publicKey)
    return offerExists ? updateOffer(offer) : addOffer(offer)
  }

  return {
    loans,
    offers: data?.offers ?? {},
    loading: isLoading,

    updateOrAddOffer,
    optimisticOffers,
    addMints,
  }
}
