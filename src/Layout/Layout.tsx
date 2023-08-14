import { FC, PropsWithChildren, useEffect, useState } from 'react'

import { WalletModal, useWalletModal } from '@banx/components/WalletModal'
import { ModalPortal } from '@banx/components/modals'

import BurgerMenu from './components/BurgerMenu'
import { Header } from './components/Header'
import { Navbar } from './components/Navbar'
import TopNotification from './components/TopNotification'

import styles from './Layout.module.less'

export const AppLayout: FC<PropsWithChildren> = ({ children }) => {
  const { visible } = useWalletModal()
  const headerHeight = useHeaderHeight()

  return (
    <div id="app-content">
      <TopNotification />
      <Header />
      <div className={styles.container}>
        {visible && <WalletModal />}
        <Navbar />
        <BurgerMenu />
        <ModalPortal />

        <div className={styles.content} style={{ height: `calc(100vh - ${headerHeight}px)` }}>
          {children}
        </div>
      </div>
    </div>
  )
}

const useHeaderHeight = () => {
  const [headerHeight, setHeaderHeight] = useState<number | undefined>(0)

  useEffect(() => {
    const headerElement = document.getElementById('header')
    if (headerElement) {
      const computedStyles = getComputedStyle(headerElement)
      const newHeaderHeight = parseFloat(computedStyles.height)
      setHeaderHeight(newHeaderHeight)
    }
  }, [])

  return headerHeight
}
