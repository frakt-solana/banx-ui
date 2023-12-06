import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'
import { calculateNextSpotPrice } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondingCurveType } from 'fbonds-core/lib/fbond-protocol/types'
import produce from 'immer'
import { create } from 'zustand'

import { Offer } from '@banx/api/core'

export interface SyntheticOffer {
  isEdit: boolean //? if offer exits on blochain and in edit mode
  publicKey: string //? PUBKEY_PLACEHOLDER for offers to create
  loanValue: number
  loansAmount: number
  deltaValue: number
  assetReceiver: string
  marketPubkey: string
  mathCounter: number
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
  deltaValue: 0,
})

export const convertToSynthetic = (offer: Offer, isEdit = false): SyntheticOffer => {
  const { publicKey, assetReceiver, hadoMarket, mathCounter, bondingCurve, buyOrdersQuantity } =
    offer

  return {
    isEdit,
    publicKey,
    loansAmount: buyOrdersQuantity,
    loanValue: calcSyntheticLoanValue(offer),
    assetReceiver,
    marketPubkey: hadoMarket,
    mathCounter,
    deltaValue: bondingCurve.delta,
  }
}

export const calcSyntheticLoanValue = (offer: Offer): number => {
  const { currentSpotPrice, baseSpotPrice, validation, bidSettlement, mathCounter, bondingCurve } =
    offer

  const prevSpotPrice = calculateNextSpotPrice({
    bondingCurveType: bondingCurve.bondingType as BondingCurveType,
    delta: bondingCurve.delta,
    spotPrice: baseSpotPrice,
    counter: mathCounter + 2,
  })

  return Math.min(validation.loanToValueFilter, currentSpotPrice + bidSettlement, prevSpotPrice)
}
