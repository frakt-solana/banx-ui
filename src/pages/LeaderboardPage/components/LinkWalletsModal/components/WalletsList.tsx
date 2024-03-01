import { WalletName } from '@solana/wallet-adapter-base'
import { useWallet } from '@solana/wallet-adapter-react'
import { sortBy } from 'lodash'

import { WalletItem } from '@banx/components/WalletModal'

import { MAGIC_EDEN_WALLET_NAME } from '@banx/constants'

import styles from '../LinkWalletsModal.module.less'

export const WalletsList = () => {
  const { wallets, select } = useWallet()

  const handleWalletSelect = (walletName: WalletName) => {
    select(walletName)
  }

  const walletsSorted = sortBy(wallets, ({ adapter }) => adapter.name !== MAGIC_EDEN_WALLET_NAME)

  return (
    <div className={styles.walletsList}>
      {walletsSorted.map(({ adapter }, idx) => (
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
