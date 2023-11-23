import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { useDiscordUser } from '@banx/hooks'
import { ChangeWallet, Copy, FRKT, SignOut } from '@banx/icons'
import { useIsLedger } from '@banx/store'
import { copyToClipboard, shortenAddress, useSolanaBalance } from '@banx/utils'

import Checkbox from '../Checkbox'
import { StatInfo, VALUES_TYPES } from '../StatInfo'
import UserAvatar from '../UserAvatar'
import { iconComponents } from './constants'
import { useFetchUserLockedRewards } from './hooks'

import styles from './WalletModal.module.less'

const UserGeneralInfo = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''
  const { data: discordUserData } = useDiscordUser()

  const { isLedger, setIsLedger } = useIsLedger()

  return (
    <div className={styles.userGeneralInfoContainer}>
      <UserAvatar className={styles.avatar} imageUrl={discordUserData?.avatarUrl ?? undefined} />
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
  const solanaBalance = useSolanaBalance({})

  const publicKeyString = publicKey?.toBase58() || ''

  const { data } = useFetchUserLockedRewards(publicKeyString)

  const displayRewardsValue = (data?.rewards || 0)?.toFixed(2)

  return (
    <div className={styles.userBalanceContainer}>
      <StatInfo flexType="row" label="Balance" value={solanaBalance} />
      <StatInfo
        flexType="row"
        label="Rewards"
        value={displayRewardsValue}
        classNamesProps={{ value: styles.userLockedTokens }}
        valueType={VALUES_TYPES.STRING}
        icon={FRKT}
      />
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
