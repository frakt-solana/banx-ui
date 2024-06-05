import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { useTokenMarketOffers } from '@banx/pages/tokenLending/LendTokenPage'
import {
  convertToSynthetic,
  createEmptySyntheticTokenOffer,
  useSyntheticTokenOffers,
} from '@banx/store/token'

export const useTokenOffer = (offerPubkey: string, marketPubkey: string) => {
  const { publicKey: walletPubkey } = useWallet()
  const walletPubkeyString = walletPubkey?.toBase58() || ''

  const { findOfferByPubkey, setOffer: setSyntheticOffer, removeOffer } = useSyntheticTokenOffers()

  const { offers, updateOrAddOffer } = useTokenMarketOffers(marketPubkey)

  const offer = useMemo(() => {
    return offers.find((offer) => offer.publicKey === offerPubkey)
  }, [offers, offerPubkey])

  const syntheticOffer = useMemo(() => {
    const foundOfferInStore = findOfferByPubkey(offerPubkey)

    if (foundOfferInStore) {
      return foundOfferInStore
    }

    if (offer) {
      return convertToSynthetic(offer, true)
    }

    return createEmptySyntheticTokenOffer({ marketPubkey, walletPubkey: walletPubkeyString })
  }, [findOfferByPubkey, offerPubkey, offer, marketPubkey, walletPubkeyString])

  const removeSyntheticOffer = () => {
    removeOffer(syntheticOffer.marketPubkey)
  }

  return {
    syntheticOffer,
    removeSyntheticOffer,
    setSyntheticOffer,
    updateOrAddOffer,
    offer,
  }
}
