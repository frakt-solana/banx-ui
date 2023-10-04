import classNames from 'classnames'

import { LoadingScreen } from '../LoadingScreen'
import { DiscordSettings } from './DiscordSettings'
import { EmailSettings } from './EmailSettings'
import { EventsSettings } from './EventsSettings'
import { TelegramSettings } from './TelegramSettings'
import { useDialectSettingsLoading } from './hooks'

import styles from '../../BanxNotificationsSider.module.less'

export const SettingsScreen = () => {
  const isLoading = useDialectSettingsLoading()

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className={classNames(styles.content)}>
      <h2 className={styles.contentTitle}>Channels</h2>
      <div className={styles.channels}>
        <DiscordSettings />
        <EmailSettings />
        <TelegramSettings />
      </div>

      <h2 className={classNames(styles.contentTitle, styles.contentTitleOffsetTop)}>Events</h2>
      <EventsSettings />
    </div>
  )
}
