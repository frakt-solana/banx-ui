import { FC } from 'react'

import { Logo, LogoFull } from '@frakt/icons'

import BurgerMenu from '../BurgerMenu'

import styles from './Header.module.less'

export const Header: FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <a href="/" className={styles.logoWrapper}>
          <LogoFull className={styles.logo} />
          <Logo className={styles.logoBasic} />
        </a>
        <div className={styles.widgetContainer}>widget</div>
        <BurgerMenu />
      </div>
    </div>
  )
}
