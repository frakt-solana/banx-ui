import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { ChangeWallet, Copy, FRKT, SignOut } from '@banx/icons'
import { useIsLedger } from '@banx/store'
import { copyToClipboard, shortenAddress, useSolanaBalance } from '@banx/utils'

import Checkbox from '../Checkbox'
import UserAvatar from '../UserAvatar'
import { iconComponents } from './constants'
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

interface UserInfoProps {
  onChangeWallet: () => void
  disconnect: () => Promise<void>
}

export const UserInfo: FC<UserInfoProps> = ({ onChangeWallet, disconnect }) => (
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
        Disconnect
      </div>
    </div>
  </div>
)

interface WalletItemProps {
  onClick: () => void
  image: string
  name: string
}

// To prevent same background for white icons
const CustomIcon: FC<{ name: string }> = ({ name }) => {
  const IconComponent = iconComponents[name]
  return IconComponent ? <IconComponent className={styles.walletIcon} /> : null
}

export const WalletItem: FC<WalletItemProps> = ({ onClick, image, name }) => {
  const customIconNames = Object.keys(iconComponents)
  const hasCustomIcon = customIconNames.includes(name)

  const shortWalletName = name.split(' ')[0]

  return (
    <div className={styles.walletItem} onClick={onClick}>
      {hasCustomIcon ? <CustomIcon name={name} /> : <img src={image} alt={name} />}
      {shortWalletName}
    </div>
  )
}
