import { FC } from 'react'

import { ConnectButton } from '@frakt/components/Buttons'
import { WalletModal, useWalletModal } from '@frakt/components/WalletModal'

import { Logo, LogoFull } from '@frakt/icons'

import { BurgerIcon } from '../BurgerMenu'

import styles from './Header.module.less'

export const Header: FC = () => {
  const { visible } = useWalletModal()

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {visible && <WalletModal />}

        <a href="/" className={styles.logoWrapper}>
          <LogoFull className={styles.logo} />
          <Logo className={styles.logoBasic} />
        </a>
        <div className={styles.widgetContainer}>
          <ConnectButton />
        </div>
        <BurgerIcon />
      </div>
    </div>
  )
}
