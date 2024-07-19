import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'

import { createEmptySyntheticOffer, useSyntheticOffers } from '@banx/store/nft'

export const useSyntheticOffer = (offerPubkey: string, marketPubkey: string) => {
  const { publicKey: walletPubkey } = useWallet()

  const { findOfferByPubkey, setOffer: setSyntheticOffer, removeOffer } = useSyntheticOffers()

  const syntheticOffer = useMemo(() => {
    return (
      findOfferByPubkey(new web3.PublicKey(offerPubkey)) ||
      createEmptySyntheticOffer({
        marketPubkey: new web3.PublicKey(marketPubkey),
        walletPubkey: walletPubkey?.toBase58() || '',
      })
    )
  }, [findOfferByPubkey, marketPubkey, walletPubkey, offerPubkey])

  const removeSyntheticOffer = () => {
    removeOffer(syntheticOffer.marketPubkey)
  }

  return { syntheticOffer, removeSyntheticOffer, setSyntheticOffer }
}
