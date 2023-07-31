import { FC } from 'react'

import { Logo, LogoFull } from '@frakt/icons'

import styles from './Header.module.less'

export const Header: FC = () => {
  return (
    <div className={styles.header}>
      <a href="/" className={styles.logoWrapper}>
        <LogoFull className={styles.logo} />
        <Logo className={styles.logoBasic} />
      </a>
    </div>
  )
}
