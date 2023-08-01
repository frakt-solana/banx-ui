import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { ChangeWallet, Copy, SignOut } from '@frakt/icons'
import { useIsLedger } from '@frakt/store'
import { copyToClipboard, shortenAddress } from '@frakt/utils'

import Checkbox from '../Checkbox'
import { UserAvatar } from '../UserAvatar'

import styles from './WalletModal.module.less'

interface UserInfoProps {
  setChangeWallet: (nextValue: boolean) => void
}

export const UserInfo: FC<UserInfoProps> = ({ setChangeWallet }) => {
  const { disconnect, publicKey } = useWallet()

  if (!publicKey) return null

  return (
    <div className={styles.userInfoContainer}>
      <UserGeneralInfo />
      <div className={styles.buttonsWrapper}>
        <div className={styles.changeWalletButton} onClick={() => setChangeWallet(true)}>
          <ChangeWallet />
          Change wallet
        </div>
        <div className={styles.signOutButton} onClick={disconnect}>
          <SignOut />
          Sign out
        </div>
      </div>
    </div>
  )
}

const UserGeneralInfo = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { isLedger, setIsLedger } = useIsLedger()

  return (
    <div className={styles.userGeneralInfoContainer}>
      <UserAvatar className={styles.avatarIcon} />
      <div className={styles.userAddressSection} onClick={() => copyToClipboard(publicKeyString)}>
        <p className={styles.addressText}>{shortenAddress(publicKeyString)}</p>
        <Copy />
      </div>
      <Checkbox
        onChange={() => setIsLedger(!isLedger)}
        label="I use ledger"
        checked={isLedger}
        className={styles.ledgerCheckbox}
      />
    </div>
  )
}
