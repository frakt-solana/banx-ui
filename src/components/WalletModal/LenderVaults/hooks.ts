import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { UserVault, fetchUserVaults } from '@banx/api/shared'
import { useClusterStats } from '@banx/hooks'
import { useTokenType } from '@banx/store/common'

import { getLenderVaultInfo } from './helpers'

export const useUserVault = () => {
  const { publicKey } = useWallet()
  const walletPublicKey = publicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

  const {
    data: userVaults,
    isLoading,
    refetch,
  } = useQuery(['userVaults', walletPublicKey], () => fetchUserVaults({ walletPublicKey }), {
    staleTime: 60_000,
    enabled: !!publicKey,
    refetchOnWindowFocus: false,
  })

  const userVault: UserVault | undefined = userVaults?.find(
    (vault) => vault.lendingTokenType === tokenType,
  )

  return {
    userVault,
    isLoading,
    refetch,
  }
}

export const useLenderVaultInfo = () => {
  const { userVault } = useUserVault()
  const { data: clusterStats } = useClusterStats()

  const lenderVaultInfo = getLenderVaultInfo({ userVault, clusterStats })

  return { lenderVaultInfo, clusterStats }
}
