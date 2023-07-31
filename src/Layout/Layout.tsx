import { FC, PropsWithChildren } from 'react'

import BurgerMenu from './components/BurgerMenu'
import { Header } from './components/Header'
import { Navbar } from './components/Navbar'

import styles from './Layout.module.less'

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div id="app-content">
      <Header />
      <div className={styles.wrapper}>
        <Navbar />
        <BurgerMenu />
        <div className={styles.container}>{children}</div>
      </div>
    </div>
  )
}

export const AppLayout: FC<PropsWithChildren> = ({ children }) => <Layout>{children}</Layout>
