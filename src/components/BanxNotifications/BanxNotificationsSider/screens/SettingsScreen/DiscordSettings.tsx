import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import UserAvatar from '@banx/components/UserAvatar'

import { DISCORD } from '@banx/constants'
import { useDiscordUser } from '@banx/hooks'
import { Alert } from '@banx/icons'
import { getDiscordUri, shortenAddress } from '@banx/utils'

import styles from './SettingsScreen.module.less'

export const DiscordSettings = () => {
  const { publicKey } = useWallet()
  const { data, isDiscordConnected, removeUserInfo } = useDiscordUser()

  const linkButtonHanlder = async () => {
    if (!publicKey) return

    if (isDiscordConnected) {
      await removeUserInfo()
      return
    }

    window.location.href = getDiscordUri(publicKey?.toBase58() || '')
  }

  return (
    <div className={styles.discordSettings}>
      <p className={styles.settingsLabel}>Discord</p>
      <div className={styles.discordSettingsWrapper}>
        <UserAvatar
          className={styles.discordSettingsAvatar}
          imageUrl={data?.avatarUrl ?? undefined}
        />
        <div className={styles.discordSettingsUserInfo}>
          <p className={styles.discordSettingsUserName}>
            {data ? shortenAddress(publicKey?.toBase58() || '') : 'Username'}
          </p>
          <Button onClick={linkButtonHanlder} variant="secondary" size="small">
            {isDiscordConnected ? 'Unlink' : 'Link'}
          </Button>
        </div>
      </div>
      <div className={styles.discordAlert}>
        <Alert />
        <p>
          Please note that you should be a member of our{' '}
          <a href={DISCORD.SERVER_URL} target="_blank" rel="noopener noreferrer">
            server
          </a>{' '}
          to receive notifications
        </p>
      </div>
    </div>
  )
}
