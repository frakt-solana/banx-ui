import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { fetchAllTotalStats, fetchBorrowerStats, fetchLenderStats } from '@banx/api/stats'

const DEFAULT_QUERY_OPTIONS = {
  staleTime: 60 * 1000, // 60 seconds
  refetchOnWindowFocus: false,
  refetchInterval: 30 * 1000, // 30 seconds
}

export const useAllTotalStats = () => {
  const { data, isLoading } = useQuery(
    ['allTotalStats'],
    () => fetchAllTotalStats(),
    DEFAULT_QUERY_OPTIONS,
  )

  return { data, isLoading }
}

export const useLenderStats = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { data, isLoading } = useQuery(
    ['lenderStats', publicKeyString],
    () => fetchLenderStats(publicKeyString),
    {
      enabled: !!publicKey,
      ...DEFAULT_QUERY_OPTIONS,
    },
  )

  return { data, isLoading }
}
export const useBorrowerStats = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { data, isLoading } = useQuery(
    ['borrowerStats', publicKeyString],
    () => fetchBorrowerStats(publicKeyString),
    {
      enabled: !!publicKey,
      ...DEFAULT_QUERY_OPTIONS,
    },
  )

  return { data, isLoading }
}
