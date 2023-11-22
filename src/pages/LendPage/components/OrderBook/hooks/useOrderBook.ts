import { MarketPreview } from '@banx/api/core'
import { useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { SyntheticOffer, useSyntheticOffers } from '@banx/store'

import { OrderBookMarketParams } from '../../ExpandableCardContent'
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
  const { offerPubkey, setOfferPubkey, marketPubkey, goToPlaceOfferTab } = props

  const { marketsPreview } = useMarketsPreview()

  const selectedMarketPreview = marketsPreview.find(
    (market) => market.marketPubkey === marketPubkey,
  )

  const { offers, bestOffer, isLoading } = useMarketOrders({ marketPubkey, offerPubkey })

  const goToEditOffer = (offer: SyntheticOffer) => {
    goToPlaceOfferTab()

    setSyntheticOffer({ ...offer, isEdit: true })
    setOfferPubkey(offer.publicKey)
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
