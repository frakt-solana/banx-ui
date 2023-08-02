import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { ChangeWallet, Copy, FRKT, Ledger, MathWallet, SignOut } from '@frakt/icons'
import { useIsLedger } from '@frakt/store'
import { copyToClipboard, shortenAddress, useSolanaBalance } from '@frakt/utils'

import Checkbox from '../Checkbox'
import UserAvatar from '../UserAvatar'
import { formatBalance, getUserRewardsValue } from './helpers'
import { useFetchUserRewards } from './hooks'

import styles from './WalletModal.module.less'

const BalanceInfo: FC<{ label: string; value: string; icon?: FC }> = ({
  value,
  label,
  icon: Icon,
}) => {
  return (
    <div className={styles.userBalanceInfo}>
      <span className={styles.userBalanceLabel}>{label}</span>
      <p className={styles.userBalanceValue}>
        {value} {Icon && <Icon />}
      </p>
    </div>
  )
}

const UserGeneralInfo = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { isLedger, setIsLedger } = useIsLedger()

  return (
    <div className={styles.userGeneralInfoContainer}>
      <UserAvatar className={styles.avatar} />
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

const UserBalance = () => {
  const { publicKey } = useWallet()
  const solanaBalance = useSolanaBalance()

  const publicKeyString = publicKey?.toBase58() || ''

  const { data } = useFetchUserRewards(publicKeyString)
  const rewardsValue = getUserRewardsValue(data)

  return (
    <div className={styles.userBalanceContainer}>
      <BalanceInfo label="Balance" value={`${formatBalance(solanaBalance)} ◎`} />
      <BalanceInfo label="Rewards" value={`${formatBalance(rewardsValue)}`} icon={FRKT} />
    </div>
  )
}

export const UserInfo: FC<{ onChangeWallet: () => void; disconnect: () => Promise<void> }> = ({
  onChangeWallet,
  disconnect,
}) => (
  <div className={styles.userInfoContainer}>
    <UserGeneralInfo />
    <UserBalance />
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
