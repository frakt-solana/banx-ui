import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { fetchLenderLoansByCertainOffer } from '@banx/api/core'
import { isLoanTerminating } from '@banx/utils'

export const useLenderLoans = ({ offerPubkey }: { offerPubkey: string }) => {
  const { publicKey } = useWallet()
  const walletPublicKey = publicKey?.toBase58() || ''

  const { data, isLoading, refetch } = useQuery(
    ['lenderLoans', walletPublicKey, offerPubkey],
    () => fetchLenderLoansByCertainOffer({ walletPublicKey, offerPubkey }),
    {
      staleTime: 60_000,
      enabled: !!offerPubkey,
      refetchOnWindowFocus: false,
    },
  )

  const lenderLoans = useMemo(() => {
    if (!data) return []

    return data.flatMap(({ loans }) => loans).filter((loan) => !isLoanTerminating(loan))
  }, [data])

  return {
    data: data ?? [],
    lenderLoans,
    isLoading,
    refetch,
  }
}
