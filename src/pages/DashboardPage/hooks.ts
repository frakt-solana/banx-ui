import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { stats } from '@banx/api/nft'
import { useTokenType } from '@banx/store/nft'
import { isSolTokenType } from '@banx/utils'

const QUERY_OPTIONS = {
  staleTime: 60 * 1000, // 60 seconds
  refetchOnWindowFocus: false,
  refetchInterval: 30 * 1000, // 30 seconds
}

export const useAllTotalStats = () => {
  const { tokenType } = useTokenType()

  const marketType = isSolTokenType(tokenType) ? 'allInSol' : 'allInUsdc'

  const { data, isLoading } = useQuery(
    ['allTotalStats', tokenType],
    () => stats.fetchAllTotalStats(marketType),
    QUERY_OPTIONS,
  )

  return { data, isLoading }
}

export const useLenderStats = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

  const { data, isLoading } = useQuery(
    ['lenderStats', publicKeyString, tokenType],
    () => stats.fetchLenderStats({ walletPubkey: publicKeyString, tokenType }),
    {
      enabled: !!publicKey,
      ...QUERY_OPTIONS,
    },
  )

  return { data, isLoading }
}
export const useBorrowerStats = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

  const { data, isLoading } = useQuery(
    ['borrowerStats', publicKeyString, tokenType],
    () => stats.fetchBorrowerStats({ walletPubkey: publicKeyString, tokenType }),
    {
      enabled: !!publicKey,
      ...QUERY_OPTIONS,
    },
  )

  return { data, isLoading }
}
