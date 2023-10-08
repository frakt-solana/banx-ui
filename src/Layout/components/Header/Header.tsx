import { useWallet } from '@solana/wallet-adapter-react'
import { NavLink } from 'react-router-dom'

import { BanxNotificationsButton } from '@banx/components/BanxNotifications'
import { Button, WalletConnectButton } from '@banx/components/Buttons'

import { Cup, Logo, LogoFull } from '@banx/icons'
import { PATHS } from '@banx/router'

import { BurgerIcon } from '../BurgerMenu/components'
import ThemeSwitcher from '../ThemeSwitcher'

import styles from './Header.module.less'

export const Header = () => {
  const { connected } = useWallet()

  return (
    <div className={styles.header}>
      <NavLink className={styles.logoWrapper} to={PATHS.ROOT}>
        <LogoFull className={styles.logo} />
        <Logo className={styles.logoBasic} />
      </NavLink>
      <div className={styles.widgetContainer}>
        <NavLink to={PATHS.LEADERBOARD}>
          <Button className={styles.rewardsButton} type="circle" variant="text">
            <Cup /> <span>Rewards</span>
          </Button>
        </NavLink>
        <ThemeSwitcher />
        {connected && <BanxNotificationsButton />}
        <WalletConnectButton />
      </div>
      <BurgerIcon />
    </div>
  )
}
