import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'

import { coreNew } from '@banx/api/nft'
import { useMarketOffers, useMarketsPreview } from '@banx/pages/nftLending/LendPage/hooks'
import { SyntheticOffer, convertToSynthetic, useSyntheticOffers } from '@banx/store/nft'
import { ZERO_BN, sortDescCompareBN } from '@banx/utils'

type UseMarketOrders = (props: { marketPubkey: string; offerPubkey: string }) => {
  offers: SyntheticOffer[]
  isLoading: boolean
  bestOffer: SyntheticOffer
  market: coreNew.MarketPreview | undefined
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
    return [...processedOffers].sort((orderA, orderB) =>
      sortDescCompareBN(orderA.loanValue, orderB.loanValue),
    )
  }, [processedOffers])

  const bestOffer = useMemo(() => {
    const [firstOffer, secondOffer] = sortedOffers
    const isFirstOfferEditable =
      firstOffer?.publicKey.equals(web3.PublicKey.default) || firstOffer?.isEdit
    return isFirstOfferEditable ? secondOffer : firstOffer
  }, [sortedOffers])

  const market = useMemo(() => {
    return marketsPreview.find((market) => market.marketPubkey.toBase58() === marketPubkey)
  }, [marketPubkey, marketsPreview])

  return {
    offers: sortedOffers,
    isLoading,
    bestOffer,
    market,
  }
}

type UseProcessedOffers = (props: {
  offers: coreNew.Offer[]
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
      .filter((offer) => offer.publicKey.toBase58() !== editableOfferPubkey)
      //? Filter empty offers. Show empty offers if assetReceiver === user
      .filter(
        (offer) =>
          !(
            offer.loansAmount.eq(ZERO_BN) &&
            offer.assetReceiver.toBase58() !== publicKey?.toBase58()
          ),
      )
      .filter(
        (offer) =>
          !(
            offer.loanValue.eq(ZERO_BN) && offer.assetReceiver.toBase58() !== publicKey?.toBase58()
          ),
      )

    if (syntheticOffer) {
      processedEditableOffers.push(syntheticOffer)
    }

    return processedEditableOffers
  }, [offerByMarketPubkey, marketPubkey, offers, editableOfferPubkey, publicKey])

  return processedOffers
}
