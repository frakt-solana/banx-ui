import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { MarketPreview, Offer } from '@banx/api/core'
import { useMarketOffers, useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { SyntheticOffer, createEmptySyntheticOffer, useSyntheticOffers } from '@banx/store'

import { OFFER_MODE, OrderBookMarketParams } from '../../ExpandableCardContent'

export interface OfferParams {
  offerPubkey: string
  marketPreview: MarketPreview | undefined
  optimisticOffer: Offer | undefined
  syntheticOffer: SyntheticOffer

  exitEditMode: () => void
  updateOrAddOffer: (offer: Offer) => void
  onChangeOfferMode: (value: OFFER_MODE) => void
  setSyntheticOffer: (offer: SyntheticOffer) => void
}

type UsePlaceOffer = (props: OrderBookMarketParams) => OfferParams & { offerMode: OFFER_MODE }

export const usePlaceOffer: UsePlaceOffer = (props) => {
  const { publicKey: walletPubkey } = useWallet()

  const { offerMode, marketPubkey, onChangeOfferMode, setOfferPubkey, offerPubkey } = props || {}

  const {
    findOfferByPubkey: findSyntheticOfferByPubkey,
    setOffer: setSyntheticOffer,
    removeOffer: removeSyntheticOffer,
  } = useSyntheticOffers()

  const syntheticOffer = useMemo(() => {
    return (
      findSyntheticOfferByPubkey(offerPubkey) ||
      createEmptySyntheticOffer({ marketPubkey, walletPubkey: walletPubkey?.toBase58() || '' })
    )
  }, [findSyntheticOfferByPubkey, marketPubkey, walletPubkey, offerPubkey])

  const exitEditMode = () => {
    setOfferPubkey('')
    removeSyntheticOffer(syntheticOffer.marketPubkey)
  }

  const { marketsPreview } = useMarketsPreview()
  const marketPreview = useMemo(() => {
    return marketsPreview.find((market) => market.marketPubkey === marketPubkey)
  }, [marketPubkey, marketsPreview])

  const { offers, updateOrAddOffer } = useMarketOffers({ marketPubkey })
  const optimisticOffer = useMemo(() => {
    return offers.find((offer) => offer.publicKey === offerPubkey)
  }, [offers, offerPubkey])

  return {
    offerMode,

    offerPubkey,
    marketPreview,

    syntheticOffer,
    setSyntheticOffer,
    optimisticOffer,
    updateOrAddOffer,

    exitEditMode,
    onChangeOfferMode,
  }
}
