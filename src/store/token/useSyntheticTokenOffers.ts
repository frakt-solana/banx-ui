import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'
import produce from 'immer'
import { create } from 'zustand'

import { core } from '@banx/api/nft'
import { calculateIdleFundsInOffer } from '@banx/utils'

export interface SyntheticTokenOffer {
  isEdit: boolean //? if offer exits on blochain and in edit mode
  publicKey: string //? PUBKEY_PLACEHOLDER for offers to create
  offerSize: number
  assetReceiver: string
  marketPubkey: string
  collateralsPerToken: number
  apr: number
}

interface SyntheticTokenOffersState {
  offerByMarketPubkey: Record<string, SyntheticTokenOffer>
  findOffer: (marketPubkey: string) => SyntheticTokenOffer | undefined
  findOfferByPubkey: (offerPubkey: string) => SyntheticTokenOffer | undefined
  setOffer: (offer: SyntheticTokenOffer) => void
  removeOffer: (marketPubkey: string) => void
}

export const useSyntheticTokenOffers = create<SyntheticTokenOffersState>((set, get) => ({
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
      produce((state: SyntheticTokenOffersState) => {
        delete state.offerByMarketPubkey[offer.marketPubkey]
        state.offerByMarketPubkey[offer.marketPubkey] = offer
      }),
    ),
  removeOffer: (marketPubkey) =>
    set(
      produce((state: SyntheticTokenOffersState) => {
        delete state.offerByMarketPubkey[marketPubkey]
      }),
    ),
}))

type CreateEmptySyntheticTokenOffer = (props: {
  marketPubkey: string
  walletPubkey: string
  isEdit?: boolean
}) => SyntheticTokenOffer

export const createEmptySyntheticTokenOffer: CreateEmptySyntheticTokenOffer = ({
  marketPubkey,
  walletPubkey,
  isEdit = false,
}) => ({
  isEdit,
  publicKey: PUBKEY_PLACEHOLDER,
  assetReceiver: walletPubkey,
  marketPubkey,
  offerSize: 0,
  collateralsPerToken: 0,
  apr: 0,
})

export const convertToSynthetic = (offer: core.Offer, isEdit = false): SyntheticTokenOffer => {
  const { publicKey, assetReceiver, hadoMarket } = offer

  const offerSize = calculateIdleFundsInOffer(offer).toNumber()
  const apr = offer.loanApr / 100

  return {
    isEdit,
    publicKey,
    offerSize,
    assetReceiver,
    marketPubkey: hadoMarket,
    collateralsPerToken: offer.validation.collateralsPerToken,
    apr,
  }
}
