import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { produce } from 'immer'
import { create } from 'zustand'

import { Offer, fetchLenderLoansAndOffers } from '@banx/api/core'

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

interface OptimisticOffersState {
  offers: Offer[]
  addOffer: (offer: Offer) => void
  findOffer: (offerPubkey: string) => Offer | null
  removeOffer: (offer: Offer) => void
  updateOffer: (offer: Offer) => void
}

const useOptimisticOffers = create<OptimisticOffersState>((set, get) => ({
  offers: [],
  addOffer: (offer) => {
    set(
      produce((state: OptimisticOffersState) => {
        state.offers.push(offer)
      }),
    )
  },
  findOffer: (offerPubkey) => {
    const { offers } = get()
    return offers.find(({ publicKey }) => publicKey === offerPubkey) ?? null
  },
  removeOffer: (offer) => {
    set(
      produce((state: OptimisticOffersState) => {
        state.offers = state.offers.filter(({ publicKey }) => publicKey !== offer.publicKey)
      }),
    )
  },
  updateOffer: (offer: Offer) => {
    const { findOffer } = get()
    const offerExists = !!findOffer(offer.publicKey)

    offerExists &&
      set(
        produce((state: OptimisticOffersState) => {
          state.offers = state.offers.map((existingOffer) =>
            existingOffer.publicKey === offer.publicKey ? offer : existingOffer,
          )
        }),
      )
  },
}))

export const useLenderLoansAndOffers = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { offers: optimisticOffers, findOffer, updateOffer, addOffer } = useOptimisticOffers()
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
