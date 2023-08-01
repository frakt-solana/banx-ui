import { useRef, useState } from 'react'

import { WalletName } from '@solana/wallet-adapter-base'
import { useWallet } from '@solana/wallet-adapter-react'

import { useOnClickOutside } from '@frakt/hooks'

import { UserInfo, WalletItem } from './components'
import { useWalletModal } from './hooks'

import styles from './WalletModal.module.less'

export const WalletModal = () => {
  const { connected, wallets, select, disconnect } = useWallet()
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
