import { useWallet } from '@solana/wallet-adapter-react'

import { MarketPreview } from '@banx/api/core'
import { useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { SyntheticOffer, useSyntheticOffers } from '@banx/store'

import { OrderBookMarketParams } from '../../ExpandableCardContent'
import { useMarketOrders } from './useMarketOrders'

export interface OrderBookParams {
  offers: SyntheticOffer[]
  goToEditOffer: (offer: SyntheticOffer) => void
  isOwnOffer: (offer: SyntheticOffer) => boolean
  bestOffer: SyntheticOffer
}

type UseOrderBook = (props: OrderBookMarketParams) => {
  orderBookParams: OrderBookParams
  selectedMarketPreview: MarketPreview | undefined
}
export const useOrderBook: UseOrderBook = (props) => {
  const { setOffer: setSyntheticOffer } = useSyntheticOffers()
  const { offerPubkey, setOfferPubkey, marketPubkey } = props
  const wallet = useWallet()
  const { marketsPreview } = useMarketsPreview()

  const selectedMarketPreview = marketsPreview.find(
    (market) => market.marketPubkey === marketPubkey,
  )

  const { offers, bestOffer } = useMarketOrders({
    marketPubkey,
    offerPubkey,
  })

  const isOwnOffer = (offer: SyntheticOffer) => {
    return offer?.assetReceiver === wallet?.publicKey?.toBase58()
  }

  const goToEditOffer = (offer: SyntheticOffer) => {
    setSyntheticOffer({
      ...offer,
      isEdit: true,
    })
    setOfferPubkey(offer.publicKey)
  }

  return {
    orderBookParams: {
      offers,
      goToEditOffer,
      isOwnOffer,
      bestOffer,
    },
    selectedMarketPreview,
  }
}
