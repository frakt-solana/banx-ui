import { MarketPreview } from '@banx/api/core'
import { useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { SyntheticOffer, useSyntheticOffers } from '@banx/store'

import { OfferMode, OrderBookMarketParams } from '../../ExpandableCardContent'
import { useMarketOrders } from './useMarketOrders'

export interface OrderBookParams {
  offers: SyntheticOffer[]
  goToEditOffer: (offer: SyntheticOffer) => void
  bestOffer: SyntheticOffer
  isLoading: boolean
}

type UseOrderBook = (props: OrderBookMarketParams) => {
  orderBookParams: OrderBookParams
  selectedMarketPreview: MarketPreview | undefined
}
export const useOrderBook: UseOrderBook = (props) => {
  const { setOffer: setSyntheticOffer } = useSyntheticOffers()
  const { offerPubkey, setOfferPubkey, marketPubkey, goToPlaceOfferTab, onChangeOfferMode } = props

  const { marketsPreview } = useMarketsPreview()

  const selectedMarketPreview = marketsPreview.find(
    (market) => market.marketPubkey === marketPubkey,
  )

  const { offers, bestOffer, isLoading } = useMarketOrders({ marketPubkey, offerPubkey })

  const goToEditOffer = (offer: SyntheticOffer) => {
    const offerMode = offer.deltaValue ? OfferMode.Pro : OfferMode.Lite
    onChangeOfferMode(offerMode)

    goToPlaceOfferTab()

    const editedOffer = { ...offer, isEdit: true }
    setSyntheticOffer(editedOffer)

    setOfferPubkey(editedOffer.publicKey)
  }

  return {
    orderBookParams: {
      offers,
      isLoading,
      goToEditOffer,
      bestOffer,
    },
    selectedMarketPreview,
  }
}
