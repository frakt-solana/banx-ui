import { useMemo } from 'react'

import { useMarketOffers, useMarketsPreview } from '@banx/pages/nftLending/LendPage'

export const useMarketAndOffer = (offerPubkey: string, marketPubkey: string) => {
  const { offers, updateOrAddOffer } = useMarketOffers({ marketPubkey })
  const { marketsPreview } = useMarketsPreview()

  const market = useMemo(() => {
    return marketsPreview.find((market) => market.marketPubkey === marketPubkey)
  }, [marketPubkey, marketsPreview])

  const offer = useMemo(() => {
    return offers.find((offer) => offer.publicKey === offerPubkey)
  }, [offers, offerPubkey])

  return { offer, market, updateOrAddOffer }
}
