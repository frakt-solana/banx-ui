import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { AssetType, stats } from '@banx/api/nft'
import { AssetMode, useAssetMode, useTokenType } from '@banx/store/common'
import { isBanxSolTokenType } from '@banx/utils'

const QUERY_OPTIONS = {
  staleTime: 60 * 1000,
  refetchOnWindowFocus: false,
  refetchInterval: 30 * 1000,
}

export const useAllTotalStats = () => {
  const { tokenType } = useTokenType()

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

  const { currentAssetMode } = useAssetMode()
  const { tokenType: marketType } = useTokenType()

  const assetType = currentAssetMode === AssetMode.NFT ? AssetType.NFT : AssetType.SPL

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

  const { currentAssetMode } = useAssetMode()
  const { tokenType: marketType } = useTokenType()

  const assetType = currentAssetMode === AssetMode.NFT ? AssetType.NFT : AssetType.SPL

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
