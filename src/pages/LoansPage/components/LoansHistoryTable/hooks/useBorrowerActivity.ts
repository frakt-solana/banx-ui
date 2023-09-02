import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { fetchBorrowerActivity } from '@banx/api/activity'

export const useBorrowerActivity = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { data, isLoading } = useQuery(
    ['borrowerActivity', publicKeyString],
    () => fetchBorrowerActivity({ walletPubkey: publicKeyString }),
    {
      enabled: !!publicKeyString,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  return {
    loans: data ?? [],
    isLoading,
  }
}
