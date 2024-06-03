import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { core } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'
import { useTokenOffersOptimistic } from '@banx/store/token'
import { isOfferClosed } from '@banx/utils'

export const useTokenOffersPreview = () => {
  const { publicKey } = useWallet()
  const walletPubkeyString = publicKey?.toBase58() || ''

  const { optimisticOffers } = useTokenOffersOptimistic()

  const { tokenType } = useNftTokenType()

  const { data, isLoading } = useQuery(
    ['useTokenOffersPreview', walletPubkeyString, tokenType],
    () => core.fetchTokenOffersPreview({ walletPubkey: walletPubkeyString, tokenType }),
    {
      staleTime: 5000,
      cacheTime: Infinity,
      refetchOnWindowFocus: false,
      enabled: !!walletPubkeyString,
    },
  )

  const offersPreview = useMemo(() => {
    if (!data) return []

    //TODO (TokenLending): Filter out offers that are closed and not have active loans
    return data.filter(
      ({ publicKey }) =>
        !optimisticOffers.find(
          ({ offer }) => offer.publicKey === publicKey && isOfferClosed(offer.pairState),
        ),
    )
  }, [data, optimisticOffers])

  return {
    offersPreview,
    isLoading,
  }
}
