import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { core } from '@banx/api/tokens'

export const useCollateralsList = () => {
  const { publicKey: walletPubkey } = useWallet()

  const { data, isLoading } = useQuery(
    ['collateralsList', walletPubkey],
    () => core.fetchCollateralsList(walletPubkey?.toBase58()),
    {
      refetchOnWindowFocus: false,
      staleTime: 60_000,
    },
  )

  return { collateralsList: data ?? [], isLoading }
}
