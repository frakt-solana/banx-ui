import { useRef, useState } from 'react'

import { WalletName } from '@solana/wallet-adapter-base'
import { useWallet } from '@solana/wallet-adapter-react'

import { useOnClickOutside } from '@frakt/hooks'

import { UserInfo } from './UserInfo'
import { WalletItem } from './WalletItem'
import { useWalletModal } from './hooks'

import styles from './WalletModal.module.less'

export const WalletModal = () => {
  const { connected, wallets, select } = useWallet()
  const { setVisible } = useWalletModal()

  const [changeWallet, setChangeWallet] = useState(false)

  const modalRef = useRef(null)
  useOnClickOutside(modalRef, () => setVisible(false))

  const shouldShowUserInfo = connected && !changeWallet
  const shouldShowWalletItems = !connected || changeWallet

  const handleWalletSelect = (walletName: WalletName) => {
    select(walletName)
    setVisible(false)
  }

  return (
    <div ref={modalRef} className={styles.modal}>
      {shouldShowUserInfo && <UserInfo setChangeWallet={setChangeWallet} />}
      {shouldShowWalletItems && (
        <div className={styles.walletItems}>
          {wallets.map(({ adapter }, idx) => (
            <WalletItem
              key={idx}
              onClick={() => handleWalletSelect(adapter.name)}
              image={adapter.icon}
              name={adapter.name}
            />
          ))}
        </div>
      )}
    </div>
  )
}
