import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { stats } from '@banx/api/nft'
import { useTokenType } from '@banx/store/common'

export const useUserOffersStats = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

  const { data, isLoading } = useQuery(
    ['userOffersStats', publicKeyString, tokenType],
    () =>
      stats.fetchUserOffersStats({
        walletPubkey: publicKeyString,
        marketType: tokenType,
        tokenType: 'nft',
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
