import { ConnectButton } from '@frakt/components/Buttons'

import { Logo, LogoFull } from '@frakt/icons'

import { BurgerIcon } from '../BurgerMenu/components'

import styles from './Header.module.less'

export const Header = () => {
  return (
    <div className={styles.header}>
      <a href="/" className={styles.logoWrapper}>
        <LogoFull className={styles.logo} />
        <Logo className={styles.logoBasic} />
      </a>
      <div className={styles.widgetContainer}>
        <ConnectButton />
      </div>
      <BurgerIcon />
    </div>
  )
}
