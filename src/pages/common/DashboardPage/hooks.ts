import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { AssetType, stats } from '@banx/api/nft'
import { ModeType, useModeType } from '@banx/store/common'
import { useNftTokenType } from '@banx/store/nft'
import { isBanxSolTokenType } from '@banx/utils'

const QUERY_OPTIONS = {
  staleTime: 60 * 1000,
  refetchOnWindowFocus: false,
  refetchInterval: 30 * 1000,
}

export const useAllTotalStats = () => {
  const { tokenType } = useNftTokenType()

  const marketType = isBanxSolTokenType(tokenType) ? 'allInSol' : 'allInUsdc'

  const { data, isLoading } = useQuery(
    ['allTotalStats', tokenType],
    () => stats.fetchAllTotalStats(marketType),
    QUERY_OPTIONS,
  )

  return { data, isLoading }
}

export const useLenderStats = () => {
  const { publicKey } = useWallet()
  const walletPubkey = publicKey?.toBase58() || ''

  const { modeType } = useModeType()
  const { tokenType: marketType } = useNftTokenType()

  const assetType = modeType === ModeType.NFT ? AssetType.NFT : AssetType.SPL

  const { data, isLoading } = useQuery(
    ['lenderStats', walletPubkey, marketType, assetType],
    () => stats.fetchLenderStats({ walletPubkey, marketType, assetType }),
    {
      enabled: !!publicKey,
      ...QUERY_OPTIONS,
    },
  )

  return { data, isLoading }
}
export const useBorrowerStats = () => {
  const { publicKey } = useWallet()
  const walletPubkey = publicKey?.toBase58() || ''

  const { modeType } = useModeType()
  const { tokenType: marketType } = useNftTokenType()

  const assetType = modeType === ModeType.NFT ? AssetType.NFT : AssetType.SPL

  const { data, isLoading } = useQuery(
    ['borrowerStats', walletPubkey, marketType, assetType],
    () => stats.fetchBorrowerStats({ walletPubkey, marketType, assetType }),
    {
      enabled: !!publicKey,
      ...QUERY_OPTIONS,
    },
  )

  return { data, isLoading }
}
