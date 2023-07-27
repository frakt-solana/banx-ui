import axios from 'axios'
import { web3 } from 'fbonds-core'
import { Dictionary } from 'lodash'

import { BACKEND_DOMAIN } from '@frakt/constants'

type DeleteNotifications = (props: {
  publicKey: web3.PublicKey
  notificationIds: string[]
}) => Promise<void>
export const deleteNotifications: DeleteNotifications = async ({ publicKey, notificationIds }) => {
  await axios.post(`https://${BACKEND_DOMAIN}/history/${publicKey.toBase58()}/delete`, {
    ids: notificationIds,
  })
}

type GetUserNotificationsSettings = (props: {
  publicKey: web3.PublicKey
}) => Promise<Dictionary<boolean>>
export const getUserNotificationsSettings: GetUserNotificationsSettings = async ({ publicKey }) => {
  const { data } = await axios.get<Dictionary<boolean>>(
    `https://${BACKEND_DOMAIN}/settings/${publicKey.toBase58()}`,
  )

  return data
}

type MarkNotificationsAsRead = (props: {
  publicKey: web3.PublicKey
  notificationIds: string[]
}) => Promise<void>
export const markNotificationsAsRead: MarkNotificationsAsRead = async ({
  publicKey,
  notificationIds,
}) => {
  await axios.post(`https://${BACKEND_DOMAIN}/history/${publicKey.toBase58()}`, {
    ids: notificationIds,
  })
}

type GetUserNotifications = (props: {
  publicKey: web3.PublicKey
}) => Promise<ReadonlyArray<Notification>>
export const getUserNotifications: GetUserNotifications = async ({ publicKey }) => {
  try {
    const { data } = await axios.get<ReadonlyArray<Notification>>(
      `https://${BACKEND_DOMAIN}/history/${publicKey.toBase58()}`,
    )

    return data ?? []
  } catch (error) {
    return []
  }
}
