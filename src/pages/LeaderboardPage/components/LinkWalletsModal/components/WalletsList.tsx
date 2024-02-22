import { WalletName } from '@solana/wallet-adapter-base'
import { useWallet } from '@solana/wallet-adapter-react'

import { WalletItem } from '@banx/components/WalletModal'

import styles from '../LinkWalletsModal.module.less'

export const WalletsList = () => {
  const { wallets, select } = useWallet()

  const handleWalletSelect = (walletName: WalletName) => {
    select(walletName)
  }

  return (
    <div className={styles.walletsList}>
      {wallets.map(({ adapter }, idx) => (
        <WalletItem
          key={idx}
          onClick={() => handleWalletSelect(adapter.name)}
          image={adapter.icon}
          name={adapter.name}
          className={styles.walletItem}
        />
      ))}
    </div>
  )
}
