import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { ChangeWallet, Copy, Ledger, MathWallet, SignOut, WalletAvatar } from '@frakt/icons'
import { useIsLedger } from '@frakt/store'
import { copyToClipboard, shortenAddress } from '@frakt/utils'

import Checkbox from '../Checkbox'

import styles from './WalletModal.module.less'

const UserAvatar: FC<{ imageUrl?: string }> = ({ imageUrl }) => {
  const avatar = imageUrl ? <img src={imageUrl} alt="user avatar" /> : <WalletAvatar />

  return <div className={styles.avatar}>{avatar}</div>
}

const UserGeneralInfo = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { isLedger, setIsLedger } = useIsLedger()

  return (
    <div className={styles.userGeneralInfoContainer}>
      <UserAvatar />
      <div className={styles.userGeneralInfo}>
        <div className={styles.userAddressSection} onClick={() => copyToClipboard(publicKeyString)}>
          <p className={styles.addressText}>{shortenAddress(publicKeyString)}</p>
          <Copy />
        </div>
        <Checkbox onChange={() => setIsLedger(!isLedger)} label="I use ledger" checked={isLedger} />
      </div>
    </div>
  )
}

export const UserInfo: FC<{ onChangeWallet: () => void; disconnect: () => Promise<void> }> = ({
  onChangeWallet,
  disconnect,
}) => (
  <div className={styles.userInfoContainer}>
    <UserGeneralInfo />
    <div className={styles.buttonsWrapper}>
      <div className={styles.changeWalletButton} onClick={onChangeWallet}>
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

interface WalletItemProps {
  onClick: () => void
  image: string
  name: string
}

const CustomIcon: FC<{ name: string }> = ({ name }) => {
  if (name === 'Ledger') return <Ledger className={styles.walletIcon} />
  if (name === 'MathWallet') return <MathWallet className={styles.walletIcon} />
  return null
}

export const WalletItem: FC<WalletItemProps> = ({ onClick, image, name }) => {
  // To prevent same background for white icons
  const hasCustomIcon = name === 'Ledger' || name === 'MathWallet'
  const shortWalletName = name.split(' ').at(0)

  return (
    <div className={styles.walletItem} onClick={onClick}>
      {hasCustomIcon ? <CustomIcon name={name} /> : <img src={image} alt={name} />}
      {shortWalletName}
    </div>
  )
}
