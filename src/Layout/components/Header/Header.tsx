import { useEffect, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { NavLink } from 'react-router-dom'
import TextTransition, { presets } from 'react-text-transition'

import { BanxNotificationsButton } from '@banx/components/BanxNotifications'
import { Button, WalletConnectButton } from '@banx/components/Buttons'
import TokenSwitcher from '@banx/components/TokenSwitcher'

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
        <Logo className={styles.logoMobile} />
      </NavLink>
      <div className={styles.widgetContainer}>
        <TokenSwitcher />
        <RewardsButton />
        <ThemeSwitcher />
        {connected && <BanxNotificationsButton />}
        <WalletConnectButton />
      </div>
      <BurgerIcon />
    </div>
  )
}

const RewardsButton = () => {
  const TOKENS = [{ text: '$BANX' }, { text: '$BONK', style: styles.rewardsButtonTextOrange }]

  const [index, setIndex] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => setIndex((index) => index + 1), 2500)
    return () => clearTimeout(intervalId)
  }, [])

  const currentToken = TOKENS[index % 2]

  return (
    <NavLink to={PATHS.LEADERBOARD}>
      <Button
        type="circle"
        variant="text"
        className={classNames(styles.rewardsButton, {
          [styles.active]: isActivePath(PATHS.LEADERBOARD),
        })}
      >
        <Cup />
        <div className={styles.rewardsButtonText}>
          Farm{' '}
          <TextTransition springConfig={presets.wobbly} className={currentToken.style}>
            {currentToken.text}
          </TextTransition>
        </div>
      </Button>
    </NavLink>
  )
}
