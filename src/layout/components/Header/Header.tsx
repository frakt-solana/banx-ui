import { useWallet } from '@solana/wallet-adapter-react'
import { NavLink } from 'react-router-dom'

import { BanxNotificationsButton } from '@banx/components/BanxNotifications'
import { WalletConnectButton } from '@banx/components/Buttons'
import TokenSwitcher from '@banx/components/TokenSwitcher'

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
      <div className={styles.logoContainer}>
        <NavLink to={PATHS.ROOT} className={styles.logoWrapper}>
          <LogoFull className={styles.logo} />
          <Logo className={styles.logoMobile} />
        </NavLink>
        <TokenSwitcher className={styles.tokenSwitcher} />
      </div>

      <div className={styles.widgetContainer}>
        <RewardsButton />
        {connected && <BanxNotificationsButton />}
        {connected && <PriorityFeesButton />}
        <ThemeSwitcher className={styles.hiddenThemeSwitcher} />
        <WalletConnectButton />
      </div>
      <BurgerIcon />
    </div>
  )
}