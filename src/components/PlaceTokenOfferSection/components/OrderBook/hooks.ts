import { useMemo } from 'react'

import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'

import { core } from '@banx/api/nft'
import {
  useTokenMarketOffers,
  useTokenMarketsPreview,
} from '@banx/pages/tokenLending/LendTokenPage'
import { SyntheticTokenOffer, convertToSynthetic, useSyntheticTokenOffers } from '@banx/store/token'

export const useMarketOrders = (marketPubkey: string, offerPubkey: string) => {
  const { offers, isLoading } = useTokenMarketOffers(marketPubkey)
  const { marketsPreview } = useTokenMarketsPreview()

  const processedOffers = useProcessedOffers({
    marketPubkey,
    offers,
    editableOfferPubkey: offerPubkey,
  })

  const sortedOffers = useMemo(() => {
    return [...processedOffers].sort((orderA, orderB) => orderB.offerSize - orderA.offerSize)
  }, [processedOffers])

  const bestOffer = useMemo(() => {
    const [firstOffer, secondOffer] = sortedOffers
    const isFirstOfferEditable = firstOffer?.publicKey === PUBKEY_PLACEHOLDER || firstOffer?.isEdit
    return isFirstOfferEditable ? secondOffer : firstOffer
  }, [sortedOffers])

  const market = useMemo(() => {
    return marketsPreview.find((market) => market.marketPubkey === marketPubkey)
  }, [marketPubkey, marketsPreview])

  return {
    offers: sortedOffers,
    isLoading,
    bestOffer,
    market,
  }
}

type UseProcessedOffers = (props: {
  offers: core.Offer[]
  marketPubkey: string
  editableOfferPubkey: string
}) => SyntheticTokenOffer[]

const useProcessedOffers: UseProcessedOffers = ({ marketPubkey, offers, editableOfferPubkey }) => {
  const { offerByMarketPubkey } = useSyntheticTokenOffers()

  const processedOffers = useMemo(() => {
    const syntheticOffer = offerByMarketPubkey[marketPubkey]

    if (!offers) return []

    const offersConvertedToSynthetic = offers.map((offer) => convertToSynthetic(offer))

    const processedEditableOffers = offersConvertedToSynthetic.filter(
      (offer) => offer.publicKey !== editableOfferPubkey,
    )

    if (syntheticOffer) {
      processedEditableOffers.push(syntheticOffer)
    }

    return processedEditableOffers
  }, [offerByMarketPubkey, marketPubkey, offers, editableOfferPubkey])

  return processedOffers
}