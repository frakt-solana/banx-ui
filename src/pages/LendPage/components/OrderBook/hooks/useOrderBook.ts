import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'
import { chain } from 'lodash'

import { MarketPreview, Offer } from '@banx/api/core'
import { useMarketOffers, useMarketsPreview } from '@banx/pages/LendPage'
import { SyntheticOffer, useSyntheticOffers } from '@banx/store'

import { OrderBookProps } from '../OrderBook'
import { useMarketOrders } from './useMarketOrders'

export interface OrderBookParams {
  syntheticOffers: SyntheticOffer[]
  goToEditOffer: (offer: SyntheticOffer) => void
  isLoading: boolean
  userOffers: Offer[]
}

type UseOrderBook = (props: OrderBookProps) => OrderBookParams & {
  market: MarketPreview | undefined
}

export const useOrderBook: UseOrderBook = (props) => {
  const { offerPubkey, setOfferPubkey, marketPubkey } = props

  const { publicKey } = useWallet()

  const { setOffer: setSyntheticOffer } = useSyntheticOffers()

  const { marketsPreview } = useMarketsPreview()

  const market = marketsPreview.find((market) => market.marketPubkey === marketPubkey)

  const { offers: syntheticOffers, isLoading } = useMarketOrders({ marketPubkey, offerPubkey })

  const { offers } = useMarketOffers({ marketPubkey })

  const userOffers = useMemo(() => {
    return chain(offers)
      .filter((offer) => offer.publicKey !== PUBKEY_PLACEHOLDER)
      .filter((offer) => offer.assetReceiver === publicKey?.toBase58())
      .value()
  }, [offers, publicKey])

  const goToEditOffer = (offer: SyntheticOffer) => {
    setSyntheticOffer({ ...offer, isEdit: true })
    setOfferPubkey(offer.publicKey)
  }

  return {
    syntheticOffers,
    isLoading,
    goToEditOffer,
    userOffers,
    market,
  }
}
