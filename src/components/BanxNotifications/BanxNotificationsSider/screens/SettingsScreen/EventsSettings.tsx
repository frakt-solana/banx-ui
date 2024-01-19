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

const HIDDEN_SUBSCRIPTIONS_IDS = [
  '009051bb-0d69-475f-b069-61e97d78c59b',
  'bf9e43f3-abdb-4a4a-9349-4646ac28cfd5',
  '4d2a64e7-8c02-41af-84ab-7b86a78e1582',
  'c982a4a4-ee1a-4ee1-8940-cffefca705de',
  '24e57f20-c33c-4640-8f58-492542018449',
]
export const EventsSettings = () => {
  const { notificationSubscriptions, updateSettings } = useEventsSettings()

  //? Filter out broken notificationSubscriptions
  const filteredSubscriptions = notificationSubscriptions.filter(
    ({ notificationType }) => !HIDDEN_SUBSCRIPTIONS_IDS.includes(notificationType.id),
  )

  return (
    <div className={styles.eventsList}>
      {!!filteredSubscriptions.length &&
        filteredSubscriptions.map((notificationSubscription) => (
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
