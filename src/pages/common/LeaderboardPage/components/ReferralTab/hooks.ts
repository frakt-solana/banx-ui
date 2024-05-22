import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { user } from '@banx/api/common'

export const useRefPersonalData = () => {
  const wallet = useWallet()

  const walletPubkeyString = wallet?.publicKey?.toBase58() || ''

  const { data, isLoading } = useQuery(
    ['refPersonalData', walletPubkeyString],
    () => user.fetchRefPersonalData({ walletPubkey: walletPubkeyString }),
    {
      staleTime: 5000,
      refetchOnWindowFocus: false,
    },
  )

  return { data, isLoading }
}
