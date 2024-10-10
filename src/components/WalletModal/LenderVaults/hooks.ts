import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { BN } from 'fbonds-core'

import { UserVault, fetchUserVaults } from '@banx/api/shared'
import { useClusterStats } from '@banx/hooks'
import { queryClient } from '@banx/providers'
import { useTokenType } from '@banx/store/common'

import { getLenderVaultInfo } from './helpers'

const USE_USER_VAULT_QUERY_KEY = 'userVaults'
const createUserVaultQueryKey = (walletPubkey: string) => [USE_USER_VAULT_QUERY_KEY, walletPubkey]

export const useUserVault = () => {
  const { publicKey } = useWallet()
  const walletPublicKey = publicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

  const { data: userVaults, isLoading } = useQuery(
    createUserVaultQueryKey(walletPublicKey),
    () => fetchUserVaults({ walletPublicKey }),
    {
      staleTime: 60_000,
      enabled: !!publicKey,
      refetchOnWindowFocus: false,
    },
  )

  const userVault: UserVault | undefined = userVaults?.find(
    (vault) => vault.lendingTokenType === tokenType,
  )

  return {
    userVault,
    isLoading,
    updateUserVaultOptimistic,
  }
}

type UpdateUserVaultOptions = {
  walletPubkey: string
  updatedUserVault: UserVault
}

const updateUserVaultOptimistic = ({ walletPubkey, updatedUserVault }: UpdateUserVaultOptions) => {
  queryClient.setQueryData(
    createUserVaultQueryKey(walletPubkey),
    (queryData: UserVault[] | undefined) => {
      if (!queryData) return queryData

      const updatedVaults = queryData.map((vault) =>
        vault.publicKey.toBase58() === updatedUserVault.publicKey.toBase58()
          ? { ...vault, ...updatedUserVault }
          : vault,
      )
      return updatedVaults
    },
  )
}

export const useLenderVaultInfo = () => {
  const { userVault, updateUserVaultOptimistic } = useUserVault()
  const { data: clusterStats } = useClusterStats()

  const lenderVaultInfo = getLenderVaultInfo({ userVault, clusterStats })

  return {
    userVault,
    lenderVaultInfo,
    updateUserVaultOptimistic,
    clusterStats,
  }
}
