import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { BanxNotificationsButton } from '@banx/components/BanxNotifications'

import { Burger, BurgerClose } from '@banx/icons'

import { PriorityFeesButton } from '../Header/components'
import {
  EXTERNAL_LINKS,
  ExternalLinks,
  NAVIGATION_LINKS,
  NavigationsLinks,
  SECONDARY_NAVIGATION_LINKS,
} from '../Navbar'
import ThemeSwitcher from '../ThemeSwitcher'
import { useBurgerMenu } from './hooks'

import styles from './BurgerMenu.module.less'

const BurgerMenu = () => {
  const { connected } = useWallet()

  const { isVisible, toggleVisibility } = useBurgerMenu()

  return (
    <>
      {isVisible && <div className={styles.overlay} />}
      <div
        className={classNames(styles.burgerMenu, { [styles.hidden]: !isVisible })}
        onClick={toggleVisibility}
      >
        <NavigationsLinks links={NAVIGATION_LINKS} />
        <NavigationsLinks links={SECONDARY_NAVIGATION_LINKS} />

        <div className={styles.communityContainer}>
          <div className={styles.widgetContainer}>
            <ThemeSwitcher />
            {connected && <BanxNotificationsButton />}
            {connected && <PriorityFeesButton />}
          </div>
          <ExternalLinks links={EXTERNAL_LINKS} />
        </div>
      </div>
    </>
  )
}

export default BurgerMenu

export const BurgerIcon = () => {
  const { isVisible, toggleVisibility } = useBurgerMenu()
  return (
    <div onClick={toggleVisibility} className={styles.burgerIcon}>
      {isVisible ? <BurgerClose /> : <Burger />}
    </div>
  )
}
