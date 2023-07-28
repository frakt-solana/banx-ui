import { useCallback, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import {
  Notification,
  deleteNotifications,
  getUserNotifications,
  markNotificationsAsRead,
} from '@frakt/api/notifications'

type UseUserNotifications = () => {
  notifications: ReadonlyArray<Notification> | null
  isLoading: boolean
  hasUnread: boolean
  markRead: (notificationIds: string[]) => Promise<void>
  clearAll: () => Promise<void>
}

export const useUserNotifications: UseUserNotifications = () => {
  const { connected, publicKey } = useWallet()

  const {
    data: notifications,
    isLoading: isNotificationsLoading,
    refetch: refetchNotifications,
  } = useQuery<ReadonlyArray<Notification>>(
    ['userNotifications'],
    async () => {
      if (!publicKey) return []

      const notifications = await getUserNotifications({ publicKey })
      return notifications as unknown as ReadonlyArray<Notification>
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
        await markNotificationsAsRead({ publicKey, notificationIds })
        refetchNotifications()
      }
    },
    [publicKey, refetchNotifications],
  )

  const clearAll = useCallback(async () => {
    if (publicKey && notifications?.length) {
      await deleteNotifications({
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
