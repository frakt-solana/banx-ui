import { FC } from 'react'

import {
  WalletNotificationSubscription,
  useNotificationSubscriptions,
} from '@dialectlabs/react-sdk'
import { debounce } from 'lodash'

import { Toggle } from '@banx/components/Toggle'

import { DIALECT } from '@banx/constants'

import styles from './SettingsScreen.module.less'

const useEventsSettings = () => {
  const { subscriptions: notificationSubscriptions, update: updateNotificationSubscription } =
    useNotificationSubscriptions({ dappAddress: DIALECT.APP_PUBLIC_KEY })

  const updateSettings = async (
    enabled: boolean,
    notificationSubscription: WalletNotificationSubscription,
  ) => {
    try {
      const { notificationType, subscription } = notificationSubscription

      await updateNotificationSubscription({
        notificationTypeId: notificationType.id,
        config: {
          ...subscription.config,
          enabled,
        },
      })
    } catch (error) {
      console.error(error)
    }
  }

  const debouncedUpdateSettings = debounce(updateSettings, 300)

  return {
    notificationSubscriptions,
    updateSettings: debouncedUpdateSettings,
  }
}

export const EventsSettings: FC = () => {
  const { notificationSubscriptions, updateSettings } = useEventsSettings()

  return (
    <div className={styles.eventsList}>
      {!!notificationSubscriptions.length &&
        notificationSubscriptions.map((notificationSubscription) => (
          <div key={notificationSubscription.notificationType.id} className={styles.eventsListRow}>
            <p>{notificationSubscription.notificationType.name}</p>
            <Toggle
              defaultChecked={notificationSubscription.subscription.config.enabled}
              onChange={(value) => updateSettings(value, notificationSubscription)}
            />
          </div>
        ))}
    </div>
  )
}
