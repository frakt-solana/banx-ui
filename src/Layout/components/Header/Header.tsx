import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { NavLink } from 'react-router-dom'

import { BanxNotificationsButton } from '@banx/components/BanxNotifications'
import { Button, WalletConnectButton } from '@banx/components/Buttons'

import { Cup, Logo, LogoFull } from '@banx/icons'
import { PATHS } from '@banx/router'

import { BurgerIcon } from '../BurgerMenu'
import { isActivePath } from '../Navbar/helpers'
import ThemeSwitcher from '../ThemeSwitcher'

import styles from './Header.module.less'

export const Header = () => {
  const { connected } = useWallet()

  return (
    <div className={styles.header}>
      <NavLink to={PATHS.ROOT} className={styles.logoWrapper}>
        <LogoFull className={styles.logo} />
        <Logo className={styles.logoBasic} />
      </NavLink>
      <div className={styles.widgetContainer}>
        <RewardsButton />
        <ThemeSwitcher />
        {connected && <BanxNotificationsButton />}
        <WalletConnectButton />
      </div>
      <BurgerIcon />
    </div>
  )
}

const RewardsButton = () => (
  <NavLink to={PATHS.LEADERBOARD}>
    <Button
      type="circle"
      variant="text"
      className={classNames(styles.rewardsButton, {
        [styles.active]: isActivePath(PATHS.LEADERBOARD),
      })}
    >
      <Cup /> <span>Farm $BANX</span>
    </Button>
  </NavLink>
)
