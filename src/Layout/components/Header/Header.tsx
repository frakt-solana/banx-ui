import { useWallet } from '@solana/wallet-adapter-react'
import { NavLink } from 'react-router-dom'

import { BanxNotificationsButton } from '@banx/components/BanxNotifications'
import { WalletConnectButton } from '@banx/components/Buttons'

import { Logo, LogoFull } from '@banx/icons'
import { PATHS } from '@banx/router'

import { BurgerIcon } from '../BurgerMenu'
import ThemeSwitcher from '../ThemeSwitcher'
import { PriorityFeesButton, RewardsButton } from './components'

import styles from './Header.module.less'

export const Header = () => {
  const { connected } = useWallet()

  return (
    <div className={styles.header}>
      <NavLink to={PATHS.ROOT} className={styles.logoWrapper}>
        <LogoFull className={styles.logo} />
        <Logo className={styles.logoMobile} />
      </NavLink>
      <div className={styles.widgetContainer}>
        <RewardsButton />
        <ThemeSwitcher />
        {connected && <BanxNotificationsButton />}
        <PriorityFeesButton />
        <WalletConnectButton />
      </div>
      <BurgerIcon />
    </div>
  )
}
