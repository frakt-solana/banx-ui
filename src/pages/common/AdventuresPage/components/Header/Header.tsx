import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import { useWalletModal } from '@banx/components/WalletModal'

import BanxImg from '@banx/assets/BanxUrban.png'

import styles from './Header.module.less'

export const Header = () => {
  const { connected } = useWallet()
  const { setVisible } = useWalletModal()

  return (
    <div className={styles.header}>
      <div className={styles.imageWrapper}>
        <img src={BanxImg} className={styles.headerImg} />
      </div>
      <div className={styles.headerText}>
        <h1>Banx adventures</h1>
        <p>Every week you can send your Banx on Adventures in order to receive rewards</p>
        {!connected && (
          <Button
            className={styles.headerConnectBtn}
            onClick={() => setVisible(true)}
            variant="primary"
          >
            Connect wallet
          </Button>
        )}
      </div>
    </div>
  )
}
