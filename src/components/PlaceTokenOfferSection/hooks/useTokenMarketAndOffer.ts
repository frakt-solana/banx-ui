import { useMemo } from 'react'

import {
  useTokenMarketOffers,
  useTokenMarketsPreview,
} from '@banx/pages/tokenLending/LendTokenPage'

export const useTokenMarketAndOffer = (offerPubkey: string, marketPubkey: string) => {
  const { offers, updateOrAddOffer } = useTokenMarketOffers(marketPubkey)
  const { marketsPreview } = useTokenMarketsPreview()

  const market = useMemo(() => {
    return marketsPreview.find((market) => market.marketPubkey === marketPubkey)
  }, [marketPubkey, marketsPreview])

  const offer = useMemo(() => {
    return offers.find((offer) => offer.publicKey.toBase58() === offerPubkey)
  }, [offers, offerPubkey])

  return { offer, market, updateOrAddOffer }
}
