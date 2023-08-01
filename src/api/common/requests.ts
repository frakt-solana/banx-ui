import axios from 'axios'

import { BACKEND_DOMAIN } from '@frakt/constants'

interface NotificationContent {
  html: string
}

type FetchModalNotification = () => Promise<string>
export const fetchModalNotification: FetchModalNotification = async () => {
  const { data } = await axios.get<NotificationContent>(`https://${BACKEND_DOMAIN}/web/modal`)

  return data?.html || ''
}

type FetchTopBarNotification = () => Promise<string>
export const fetchTopBarNotification: FetchTopBarNotification = async () => {
  const { data } = await axios.get<NotificationContent>(`https://${BACKEND_DOMAIN}/web/topbar`)

  return data?.html || ''
}
