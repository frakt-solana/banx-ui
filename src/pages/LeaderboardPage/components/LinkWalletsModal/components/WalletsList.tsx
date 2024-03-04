import { WalletItem } from '@banx/components/WalletModal'

import { useWalletAdapters } from '@banx/hooks'

import styles from '../LinkWalletsModal.module.less'

export const WalletsList = () => {
  const wallets = useWalletAdapters()

  return (
    <div className={styles.walletsList}>
      {wallets.map(({ adapter, select }, idx) => (
        <WalletItem
          key={idx}
          onClick={select}
          image={adapter.icon}
          name={adapter.name}
          className={styles.walletItem}
        />
      ))}
    </div>
  )
}
