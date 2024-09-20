import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { stats } from '@banx/api/nft'
import { useNftTokenType } from '@banx/store/nft'
import { isBanxSolTokenType, isSolTokenType } from '@banx/utils'

const QUERY_OPTIONS = {
  staleTime: 60 * 1000,
  refetchOnWindowFocus: false,
  refetchInterval: 30 * 1000,
}

export const useAllTotalStats = () => {
  const { tokenType } = useNftTokenType()

  const marketType =
    isSolTokenType(tokenType) || isBanxSolTokenType(tokenType) ? 'allInSol' : 'allInUsdc'

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

  const { tokenType } = useNftTokenType()

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

  const { tokenType } = useNftTokenType()

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
