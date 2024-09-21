import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { createEmptySyntheticTokenOffer, useSyntheticTokenOffers } from '@banx/store/token'

export const useTokenOffer = (offerPubkey: string, marketPubkey: string) => {
  const { publicKey: walletPubkey } = useWallet()

  const { findOfferByPubkey, setOffer: setSyntheticOffer, removeOffer } = useSyntheticTokenOffers()

  const syntheticOffer = useMemo(() => {
    return (
      findOfferByPubkey(offerPubkey) ||
      createEmptySyntheticTokenOffer({ marketPubkey, walletPubkey: walletPubkey?.toBase58() || '' })
    )
  }, [findOfferByPubkey, marketPubkey, walletPubkey, offerPubkey])

  const removeSyntheticOffer = () => {
    removeOffer(syntheticOffer.marketPubkey)
  }

  return { syntheticOffer, removeSyntheticOffer, setSyntheticOffer }
}
