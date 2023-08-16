import { create } from 'zustand'

import { SyntheticParams } from '../OrderBook'

interface OfferStore {
  offerPubkey: string
  syntheticParams: SyntheticParams | null
  setOfferPubkey: (offerPubkey: string) => void
  setSyntheticParams: (params: SyntheticParams | null) => void
}

export const useOfferStore = create<OfferStore>((set) => ({
  offerPubkey: '',
  syntheticParams: null,
  setOfferPubkey: (offerPubkey) => set({ offerPubkey }),
  setSyntheticParams: (params) => set({ syntheticParams: params }),
}))
