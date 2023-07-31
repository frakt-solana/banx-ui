import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { ChangeWallet, SignOut } from '@frakt/icons'

import styles from './WalletModal.module.less'

interface UserInfoProps {
  setChangeWallet: (nextValue: boolean) => void
}

export const UserInfo: FC<UserInfoProps> = ({ setChangeWallet }) => {
  const { disconnect, publicKey } = useWallet()

  if (!publicKey) return null

  return (
    <div className={styles.userInfo}>
      <div className={styles.buttonsWrapper}>
        <div className={styles.button} onClick={() => setChangeWallet(true)}>
          <ChangeWallet />
          Change wallet
        </div>
        <div className={styles.button} onClick={disconnect}>
          <SignOut />
          Sign out
        </div>
      </div>
    </div>
  )
}
