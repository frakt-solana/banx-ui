import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { fetchActivityCollectionsList } from '@banx/api/activity'

export const useLenderActivityCollectionsList = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { data, isLoading } = useQuery(
    ['lenderActivityCollectionsList', publicKeyString],
    () => fetchActivityCollectionsList({ walletPubkey: publicKeyString, userType: 'lender' }),
    {
      enabled: !!publicKeyString,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  return {
    data: data ?? [],
    isLoading,
  }
}
