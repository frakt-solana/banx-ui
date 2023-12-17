import { useEffect, useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { useMarketOffers, useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { SyntheticOffer, createEmptySyntheticOffer, useSyntheticOffers } from '@banx/store'

import { OfferMode } from '../components'

export const useSyntheticOffer = (offerPubkey: string, marketPubkey: string) => {
  const { publicKey: walletPubkey } = useWallet()

  const { findOfferByPubkey, setOffer: setSyntheticOffer, removeOffer } = useSyntheticOffers()

  const syntheticOffer = useMemo(() => {
    return (
      findOfferByPubkey(offerPubkey) ||
      createEmptySyntheticOffer({ marketPubkey, walletPubkey: walletPubkey?.toBase58() || '' })
    )
  }, [findOfferByPubkey, marketPubkey, walletPubkey, offerPubkey])

  const removeSyntheticOffer = () => {
    removeOffer(syntheticOffer.marketPubkey)
  }

  return { syntheticOffer, removeSyntheticOffer, setSyntheticOffer }
}

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

export const useOfferMode = (syntheticOffer: SyntheticOffer) => {
  const { deltaValue, isEdit } = syntheticOffer

  const defaultOfferMode = deltaValue ? OfferMode.Pro : OfferMode.Lite

  const [offerMode, setOfferMode] = useState(defaultOfferMode)

  useEffect(() => {
    if (!isEdit) return

    if (deltaValue) {
      return setOfferMode(OfferMode.Pro)
    }

    return setOfferMode(OfferMode.Lite)
  }, [syntheticOffer, isEdit, deltaValue])

  return { offerMode, onChangeOfferMode: setOfferMode }
}
