import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'
import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'

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
    return [...processedOffers].sort(
      (orderA, orderB) => orderA.collateralsPerToken - orderB.collateralsPerToken,
    )
  }, [processedOffers])

  const bestOffer = useMemo(() => {
    const [firstOffer, secondOffer] = sortedOffers
    const isFirstOfferEditable =
      firstOffer?.publicKey.toBase58() === PUBKEY_PLACEHOLDER || firstOffer?.isEdit
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
  offers: BondOfferV3[]
  marketPubkey: string
  editableOfferPubkey: string
}) => SyntheticTokenOffer[]

const useProcessedOffers: UseProcessedOffers = ({ marketPubkey, offers, editableOfferPubkey }) => {
  const { offerByMarketPubkey } = useSyntheticTokenOffers()
  const { publicKey } = useWallet()

  const processedOffers = useMemo(() => {
    const syntheticOffer = offerByMarketPubkey[marketPubkey]

    if (!offers) return []

    const offersConvertedToSynthetic = offers.map((offer) => convertToSynthetic(offer))

    const processedEditableOffers = offersConvertedToSynthetic
      .filter((offer) => offer.publicKey.toBase58() !== editableOfferPubkey)
      //? Filter empty offers, but alwaus show user offers
      .filter((offer) => !(offer.offerSize === 0 && offer.assetReceiver !== publicKey?.toBase58()))

    if (syntheticOffer) {
      processedEditableOffers.push(syntheticOffer)
    }

    return processedEditableOffers
  }, [offerByMarketPubkey, marketPubkey, offers, editableOfferPubkey, publicKey])

  return processedOffers
}
