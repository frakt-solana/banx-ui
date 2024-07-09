import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { stats } from '@banx/api/nft'
import { useNftTokenType } from '@banx/store/nft'

export const useUserTokenOffersStats = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { tokenType } = useNftTokenType()

  const { data, isLoading } = useQuery(
    ['userTokenOffersStats', publicKeyString, tokenType],
    () =>
      stats.fetchUserOffersStats({
        walletPubkey: publicKeyString,
        marketType: tokenType,
        tokenType: 'spl',
      }),
    {
      enabled: !!publicKeyString,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  return {
    data,
    isLoading,
  }
}
