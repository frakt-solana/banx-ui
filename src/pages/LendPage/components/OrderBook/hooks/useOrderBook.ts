import { MarketPreview, Offer } from '@banx/api/core'
import { useMarketOffers, useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { SyntheticOffer, useSyntheticOffers } from '@banx/store'

import { OrderBookMarketParams } from '../OrderBook'
import { useMarketOrders } from './useMarketOrders'

export interface OrderBookParams {
  syntheticOffers: SyntheticOffer[]
  goToEditOffer: (offer: SyntheticOffer) => void
  bestOffer: SyntheticOffer
  isLoading: boolean
  offers: Offer[]
  updateOrAddOffer: (offer: Offer) => void
}

type UseOrderBook = (props: OrderBookMarketParams) => {
  orderBookParams: OrderBookParams
  selectedMarketPreview: MarketPreview | undefined
}

export const useOrderBook: UseOrderBook = (props) => {
  const { offerPubkey, setOfferPubkey, marketPubkey, goToPlaceOfferTab } = props

  const { setOffer: setSyntheticOffer } = useSyntheticOffers()

  const { marketsPreview } = useMarketsPreview()

  const selectedMarketPreview = marketsPreview.find(
    (market) => market.marketPubkey === marketPubkey,
  )

  const {
    offers: syntheticOffers,
    bestOffer,
    isLoading,
  } = useMarketOrders({ marketPubkey, offerPubkey })

  const { offers, updateOrAddOffer } = useMarketOffers({ marketPubkey })

  const goToEditOffer = (offer: SyntheticOffer) => {
    setSyntheticOffer({ ...offer, isEdit: true })
    setOfferPubkey(offer.publicKey)

    goToPlaceOfferTab()
  }

  return {
    orderBookParams: {
      syntheticOffers,
      isLoading,
      goToEditOffer,
      bestOffer,
      offers,
      updateOrAddOffer,
    },
    selectedMarketPreview,
  }
}
