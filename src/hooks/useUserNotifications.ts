import { useCallback, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import {
  deleteBanxNotifications,
  getBanxUserNotifications,
  markBanxNotificationsAsRead,
} from '@banx/api/user'

export const useUserNotifications = () => {
  const { connected, publicKey } = useWallet()

  const {
    data: notifications,
    isLoading: isNotificationsLoading,
    refetch: refetchNotifications,
  } = useQuery(
    ['userNotifications'],
    async () => {
      if (!publicKey) return []

      return await getBanxUserNotifications({ publicKey })
    },
    {
      enabled: connected,
      staleTime: 2000,
      refetchInterval: 5000,
    },
  )

  const markRead = useCallback(
    async (notificationIds: string[] = []) => {
      if (publicKey) {
        await markBanxNotificationsAsRead({ publicKey, notificationIds })
        refetchNotifications()
      }
    },
    [publicKey, refetchNotifications],
  )

  const clearAll = useCallback(async () => {
    if (publicKey && notifications?.length) {
      await deleteBanxNotifications({
        publicKey,
        notificationIds: notifications.map((notify) => notify.id) || [],
      })
      refetchNotifications()
    }
  }, [publicKey, refetchNotifications, notifications])

  const hasUnread = useMemo(() => {
    return !!notifications?.find(({ isRead }) => !isRead)
  }, [notifications])

  return {
    notifications: notifications ?? null,
    isLoading: isNotificationsLoading,
    hasUnread,
    markRead,
    clearAll,
  }
}
