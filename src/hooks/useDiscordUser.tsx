import { useCallback } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { web3 } from 'fbonds-core'

import { fetchDiscordUser, removeDiscordUser } from '@banx/api/user'

export const useDiscordUser = () => {
  const { connected, publicKey } = useWallet()

  const {
    isLoading,
    data,
    refetch: refetchUserInfo,
  } = useQuery(
    ['discordUser'],
    () => fetchDiscordUser({ publicKey: publicKey as web3.PublicKey }),
    {
      enabled: connected,
      staleTime: 60 * 1000,
    },
  )

  const removeUserInfo = useCallback(async () => {
    await removeDiscordUser({ publicKey: publicKey as web3.PublicKey })
    refetchUserInfo()
  }, [publicKey, refetchUserInfo])

  return {
    data,
    isLoading,
    removeUserInfo,
    isDiscordConnected: data?.isOnServer ?? false,
  }
}
