import { BN, web3 } from 'fbonds-core'
import { calculateNextSpotPriceBN } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import produce from 'immer'
import { create } from 'zustand'

import { coreNew } from '@banx/api/nft'
import { ONE_BN, ZERO_BN } from '@banx/utils'

export interface SyntheticOffer {
  isEdit: boolean //? if offer exits on blochain and in edit mode
  publicKey: web3.PublicKey //? web3.PublicKey.default for offers to create
  loanValue: BN
  loansAmount: BN
  deltaValue: BN
  assetReceiver: web3.PublicKey
  marketPubkey: web3.PublicKey
  mathCounter: BN
}

interface SyntheticOffersState {
  offerByMarketPubkey: Record<string, SyntheticOffer>
  findOffer: (marketPubkey: string) => SyntheticOffer | undefined
  findOfferByPubkey: (offerPubkey: web3.PublicKey) => SyntheticOffer | undefined
  setOffer: (offer: SyntheticOffer) => void
  removeOffer: (marketPubkey: web3.PublicKey) => void
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
        delete state.offerByMarketPubkey[offer.marketPubkey.toBase58()]
        state.offerByMarketPubkey[offer.marketPubkey.toBase58()] = offer
      }),
    ),
  removeOffer: (marketPubkey) =>
    set(
      produce((state: SyntheticOffersState) => {
        delete state.offerByMarketPubkey[marketPubkey.toBase58()]
      }),
    ),
}))

type CreateEmptySyntheticOffer = (props: {
  marketPubkey: web3.PublicKey
  walletPubkey: string
  isEdit?: boolean
}) => SyntheticOffer
export const createEmptySyntheticOffer: CreateEmptySyntheticOffer = ({
  marketPubkey,
  walletPubkey,
  isEdit = false,
}) => ({
  isEdit,
  publicKey: web3.PublicKey.default,
  loanValue: ZERO_BN,
  loansAmount: ZERO_BN,
  assetReceiver: new web3.PublicKey(walletPubkey),
  marketPubkey,
  mathCounter: ZERO_BN,
  deltaValue: ZERO_BN,
})

export const convertToSynthetic = (offer: coreNew.Offer, isEdit = false): SyntheticOffer => {
  const { publicKey, assetReceiver, hadoMarket, mathCounter, bondingCurve, buyOrdersQuantity } =
    offer

  const loanValue = calcSyntheticLoanValue(offer)
  return {
    isEdit,
    publicKey,
    loansAmount: loanValue.gt(ZERO_BN) ? BN.max(buyOrdersQuantity, ONE_BN) : ZERO_BN,
    loanValue: loanValue,
    assetReceiver,
    marketPubkey: hadoMarket,
    mathCounter,
    deltaValue: bondingCurve.delta,
  }
}

export const calcSyntheticLoanValue = (offer: coreNew.Offer): BN => {
  const {
    currentSpotPrice,
    baseSpotPrice,
    validation,
    bidSettlement,
    mathCounter,
    bondingCurve,
    buyOrdersQuantity,
  } = offer

  const prevSpotPrice = calculateNextSpotPriceBN({
    bondingCurveType: bondingCurve.bondingType,
    delta: bondingCurve.delta,
    spotPrice: baseSpotPrice,
    counter: mathCounter.add(new BN(2)),
  })

  return BN.min(
    validation.loanToValueFilter,
    BN.min(
      (buyOrdersQuantity.gt(ZERO_BN) ? currentSpotPrice : ZERO_BN).add(bidSettlement),
      prevSpotPrice,
    ),
  )
}
