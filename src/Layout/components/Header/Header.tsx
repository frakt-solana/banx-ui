import { BanxNotificationsButton } from '@banx/components/BanxNotifications'
import { WalletConnectButton } from '@banx/components/Buttons'

import { Logo, LogoFull } from '@banx/icons'

import { BurgerIcon } from '../BurgerMenu/components'
import ThemeSwitcher from '../ThemeSwitcher'

import styles from './Header.module.less'

export const Header = () => {
  return (
    <div className={styles.header}>
      <a href="/" className={styles.logoWrapper}>
        <LogoFull className={styles.logo} />
        <Logo className={styles.logoBasic} />
      </a>
      <div className={styles.widgetContainer}>
        <ThemeSwitcher />
        <BanxNotificationsButton />
        <WalletConnectButton />
      </div>
      <BurgerIcon />
    </div>
  )
}
