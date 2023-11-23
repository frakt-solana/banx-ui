import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { fetchLenderLoansAndOffersV2 } from '@banx/api/core'

export const useLenderLoansAndOffers = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { data, isLoading } = useQuery(
    ['lenderLoansAndOffers', publicKeyString],
    () => fetchLenderLoansAndOffersV2({ walletPublicKey: publicKeyString }),
    {
      enabled: !!publicKeyString,
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  )

  return {
    data: data ?? [],
    isLoading,
  }
}
