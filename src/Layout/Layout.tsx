import { FC, PropsWithChildren } from 'react'

import { WalletModal, useWalletModal } from '@frakt/components/WalletModal'

import BurgerMenu from './components/BurgerMenu'
import { Header } from './components/Header'
import { Navbar } from './components/Navbar'

import styles from './Layout.module.less'

export const AppLayout: FC<PropsWithChildren> = ({ children }) => {
  const { visible } = useWalletModal()

  return (
    <div id="app-content">
      <Header />
      <div className={styles.container}>
        {visible && <WalletModal />}
        <Navbar />
        <BurgerMenu />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  )
}
