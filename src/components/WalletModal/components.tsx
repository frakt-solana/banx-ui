import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { web3 } from 'fbonds-core'

import { useDiscordUser } from '@banx/hooks'
import { ChangeWallet, Copy, Logo, SignOut } from '@banx/icons'
import { useIsLedger } from '@banx/store'
import { copyToClipboard, formatNumbersWithCommas, shortenAddress } from '@banx/utils'

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

  const publicKeyString = publicKey?.toBase58() || ''

  const { data } = useFetchUserLockedRewards(publicKeyString)

  const alloc = data?.sum ? data?.sum / BigInt(web3.LAMPORTS_PER_SOL) : 0

  const displayRewardsValue = formatNumbersWithCommas(alloc.toString())

  return (
    <div className={styles.userBalanceContainer}>
      <StatInfo
        flexType="row"
        label="Rewards"
        value={displayRewardsValue}
        classNamesProps={{ container: styles.userRewards, value: styles.userLockedTokens }}
        valueType={VALUES_TYPES.STRING}
        icon={Logo}
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
  className?: string
}

// To prevent same background for white icons
const CustomIcon: FC<{ name: string }> = ({ name }) => {
  const IconComponent = iconComponents[name]
  return IconComponent ? <IconComponent className={styles.walletIcon} /> : null
}

export const WalletItem: FC<WalletItemProps> = ({ onClick, image, name, className }) => {
  const customIconNames = Object.keys(iconComponents)
  const hasCustomIcon = customIconNames.includes(name)

  const shortWalletName = name.split(' ')[0]

  return (
    <div className={classNames(styles.walletItem, className)} onClick={onClick}>
      {hasCustomIcon ? <CustomIcon name={name} /> : <img src={image} alt={name} />}
      {shortWalletName}
    </div>
  )
}
