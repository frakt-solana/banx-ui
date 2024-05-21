import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'

import { core } from '@banx/api/nft'
import { useMarketOffers, useMarketsPreview } from '@banx/pages/nftLending/LendPage/hooks'
import { SyntheticOffer, convertToSynthetic, useSyntheticOffers } from '@banx/store/nft'

type UseMarketOrders = (props: { marketPubkey: string; offerPubkey: string }) => {
  offers: SyntheticOffer[]
  isLoading: boolean
  bestOffer: SyntheticOffer
  market: core.MarketPreview | undefined
}

export const useMarketOrders: UseMarketOrders = ({ marketPubkey, offerPubkey }) => {
  const { offers, isLoading } = useMarketOffers({ marketPubkey })
  const { marketsPreview } = useMarketsPreview()

  const processedOffers = useProcessedOffers({
    marketPubkey,
    offers,
    editableOfferPubkey: offerPubkey,
  })

  const sortedOffers = useMemo(() => {
    return [...processedOffers].sort((orderA, orderB) => orderB.loanValue - orderA.loanValue)
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
}) => SyntheticOffer[]

const useProcessedOffers: UseProcessedOffers = ({ marketPubkey, offers, editableOfferPubkey }) => {
  const { offerByMarketPubkey } = useSyntheticOffers()
  const { publicKey } = useWallet()

  const processedOffers = useMemo(() => {
    const syntheticOffer = offerByMarketPubkey[marketPubkey]

    if (!offers) return []

    const offersConvertedToSynthetic = offers.map((offer) => convertToSynthetic(offer))

    const processedEditableOffers = offersConvertedToSynthetic
      .filter((offer) => offer.publicKey !== editableOfferPubkey)
      //? Filter empty offers. Show empty offers if assetReceiver === user
      .filter(
        (offer) => !(offer.loansAmount === 0 && offer.assetReceiver !== publicKey?.toBase58()),
      )
      .filter((offer) => !(offer.loanValue === 0 && offer.assetReceiver !== publicKey?.toBase58()))

    if (syntheticOffer) {
      processedEditableOffers.push(syntheticOffer)
    }

    return processedEditableOffers
  }, [offerByMarketPubkey, marketPubkey, offers, editableOfferPubkey, publicKey])

  return processedOffers
}
