import { useRef, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { useOnClickOutside, useWalletAdapters } from '@banx/hooks'

import { UserInfo, WalletItem } from './components'
import { useWalletModal } from './hooks'

import styles from './WalletModal.module.less'

export const WalletModal = () => {
  const [changeWallet, setChangeWallet] = useState(false)
  const { connected, disconnect } = useWallet()
  const { setVisible } = useWalletModal()

  const wallets = useWalletAdapters({
    onWalletSelect: () => setVisible(false),
  })

  const modalRef = useRef(null)
  useOnClickOutside(modalRef, () => setVisible(false))

  const shouldShowUserInfo = connected && !changeWallet
  const shouldShowWalletItems = !connected || changeWallet

  const handleChangeWallet = () => {
    setChangeWallet(true)
  }

  return (
    <div ref={modalRef} className={styles.modal}>
      {shouldShowUserInfo && (
        <UserInfo onChangeWallet={handleChangeWallet} disconnect={disconnect} />
      )}
      {shouldShowWalletItems && (
        <div className={styles.walletItems}>
          {wallets.map(({ adapter, select }, idx) => (
            <WalletItem key={idx} onClick={select} image={adapter.icon} name={adapter.name} />
          ))}
        </div>
      )}
    </div>
  )
}
