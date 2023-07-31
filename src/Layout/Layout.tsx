import { FC, PropsWithChildren } from 'react'

import { Header } from './components/Header'

import styles from './Layout.module.less'

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div id="app-content">
      <Header />
      <div className={styles.container}>{children}</div>
    </div>
  )
}

export const AppLayout: FC<PropsWithChildren> = ({ children }) => <Layout>{children}</Layout>
