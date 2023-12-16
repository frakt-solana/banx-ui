import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { fetchLenderLoansByCertainOffer } from '@banx/api/core'

export const useLenderLoans = (offerPubKey: string) => {
  const { publicKey } = useWallet()
  const walletPublicKey = publicKey?.toBase58() || ''

  const { data, isLoading, refetch } = useQuery(
    ['lenderLoans', walletPublicKey, offerPubKey],
    () => fetchLenderLoansByCertainOffer({ walletPublicKey, offerPubKey }),
    {
      staleTime: 60_000,
      refetchInterval: 5_000,
      refetchOnWindowFocus: false,
    },
  )

  const lenderLoans = useMemo(() => {
    if (!data) return []

    return data.flatMap(({ loans }) => loans)
  }, [data])

  return {
    data: data ?? [],
    lenderLoans,
    isLoading,
    refetch,
  }
}
