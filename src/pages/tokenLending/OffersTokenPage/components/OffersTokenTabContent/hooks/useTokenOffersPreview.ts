import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { core } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'

export const useTokenOffersPreview = () => {
  const { publicKey } = useWallet()
  const walletPubkeyString = publicKey?.toBase58() || ''

  const { tokenType } = useNftTokenType()

  const { data, isLoading } = useQuery(
    ['useTokenOffersPreview', tokenType],
    () => core.fetchTokenOffersPreview({ walletPubkey: walletPubkeyString, tokenType }),
    {
      staleTime: 5000,
      cacheTime: Infinity,
      refetchOnWindowFocus: false,
    },
  )

  return {
    offersPreview: data ?? [],
    isLoading,
  }
}
