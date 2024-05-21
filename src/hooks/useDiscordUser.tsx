import { useCallback } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { web3 } from 'fbonds-core'

import { user } from '@banx/api/common'

export const useDiscordUser = () => {
  const { publicKey } = useWallet()

  const {
    isLoading,
    data,
    refetch: refetchUserInfo,
  } = useQuery(
    ['discordUser', publicKey?.toBase58()],
    () => user.fetchDiscordUser({ publicKey: publicKey as web3.PublicKey }),
    {
      enabled: !!publicKey,
      staleTime: 60 * 1000,
    },
  )

  const removeUserInfo = useCallback(async () => {
    await user.removeDiscordUser({ publicKey: publicKey as web3.PublicKey })
    refetchUserInfo()
  }, [publicKey, refetchUserInfo])

  return {
    data,
    isLoading,
    removeUserInfo,
    isDiscordConnected: data?.isOnServer ?? false,
  }
}
