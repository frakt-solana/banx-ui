import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'
import produce from 'immer'
import { create } from 'zustand'

import { Offer } from '@banx/api/core'

export interface SyntheticOffer {
  isEdit: boolean //? if offer exits on blochain and in edit mode
  publicKey: string //? PUBKEY_PLACEHOLDER for offers to create
  loanValue: number
  loansAmount: number
  deltaValue?: number //? exist only in pro mode
  assetReceiver: string
  marketPubkey: string
  mathCounter?: number
}

interface SyntheticOffersState {
  offerByMarketPubkey: Record<string, SyntheticOffer>
  findOffer: (marketPubkey: string) => SyntheticOffer | undefined
  findOfferByPubkey: (offerPubkey: string) => SyntheticOffer | undefined
  setOffer: (offer: SyntheticOffer) => void
  removeOffer: (marketPubkey: string) => void
}

export const useSyntheticOffers = create<SyntheticOffersState>((set, get) => ({
  offerByMarketPubkey: {},
  findOffer: (marketPubkey) => {
    return get().offerByMarketPubkey[marketPubkey]
  },
  findOfferByPubkey: (offerPubkey) => {
    const { offerByMarketPubkey } = get()
    return Object.values(offerByMarketPubkey).find(({ publicKey }) => publicKey === offerPubkey)
  },
  setOffer: (offer) =>
    set(
      produce((state: SyntheticOffersState) => {
        delete state.offerByMarketPubkey[offer.marketPubkey]
        state.offerByMarketPubkey[offer.marketPubkey] = offer
      }),
    ),
  removeOffer: (marketPubkey) =>
    set(
      produce((state: SyntheticOffersState) => {
        delete state.offerByMarketPubkey[marketPubkey]
      }),
    ),
}))

type CreateEmptySyntheticOffer = (props: {
  marketPubkey: string
  walletPubkey: string
  isEdit?: boolean
}) => SyntheticOffer
export const createEmptySyntheticOffer: CreateEmptySyntheticOffer = ({
  marketPubkey,
  walletPubkey,
  isEdit = false,
}) => ({
  isEdit,
  publicKey: PUBKEY_PLACEHOLDER,
  loanValue: 0,
  loansAmount: 0,
  assetReceiver: walletPubkey,
  marketPubkey,
  mathCounter: 0,
})

export const convertToSynthetic = (offer: Offer, isEdit = false): SyntheticOffer => {
  const {
    fundsSolOrTokenBalance,
    currentSpotPrice,
    publicKey,
    assetReceiver,
    hadoMarket,
    mathCounter,
  } = offer

  const loansAmount = fundsSolOrTokenBalance / currentSpotPrice
  const loanValue = currentSpotPrice * Math.min(loansAmount, 1)

  return {
    isEdit,
    publicKey,
    loansAmount,
    loanValue,
    assetReceiver,
    marketPubkey: hadoMarket,
    mathCounter,
  }
}
