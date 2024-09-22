import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { useBanxSolBalance, useDiscordUser, useSolanaBalance } from '@banx/hooks'
import { BanxSOL, ChangeWallet, Copy, SignOut } from '@banx/icons'
import { AssetMode, useAssetMode, useIsLedger } from '@banx/store/common'
import { useNftTokenType } from '@banx/store/nft'
import {
  copyToClipboard,
  formatValueByTokenType,
  isBanxSolTokenType,
  shortenAddress,
} from '@banx/utils'

import Checkbox from '../Checkbox'
import { StatInfo } from '../StatInfo'
import { DisplayValue } from '../TableComponents'
import UserAvatar from '../UserAvatar'
import { NftLenderVault, TokenLenderVault } from './LenderVaults'
import { iconComponents } from './constants'

import styles from './WalletModal.module.less'

const UserGeneralInfo = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''
  const { data: discordUserData } = useDiscordUser()

  const solWalletBalance = useSolanaBalance({ isLive: true })
  const banxSolWalletBalance = useBanxSolBalance({ isLive: true })

  const { isLedger, setIsLedger } = useIsLedger()
  const { tokenType } = useNftTokenType()

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
      {isBanxSolTokenType(tokenType) && (
        <BalanceContent
          solWalletBalance={solWalletBalance}
          banxSolWalletBalance={banxSolWalletBalance}
          tokenType={tokenType}
        />
      )}
    </div>
  )
}

interface BalanceContentProps {
  solWalletBalance: number
  banxSolWalletBalance: number
  tokenType: LendingTokenType
}
const BalanceContent: FC<BalanceContentProps> = ({
  solWalletBalance,
  banxSolWalletBalance,
  tokenType,
}) => {
  const formattedBanxSolWalletBalance = banxSolWalletBalance
    ? formatValueByTokenType(banxSolWalletBalance, tokenType)
    : 0

  return (
    <div className={styles.balanceContainer}>
      <div className={styles.balanceContent}>
        <StatInfo
          value={formattedBanxSolWalletBalance}
          classNamesProps={{ value: styles.balanceValue }}
          icon={BanxSOL}
          flexType="row"
        />
        <div className={styles.verticalLine} />
        <StatInfo
          value={<DisplayValue value={solWalletBalance} />}
          classNamesProps={{ value: styles.balanceValue }}
          flexType="row"
        />
      </div>
      <span className={styles.balanceLabel}>Wallet balance</span>
    </div>
  )
}

interface UserInfoProps {
  onChangeWallet: () => void
  disconnect: () => Promise<void>
}

export const UserInfo: FC<UserInfoProps> = ({ onChangeWallet, disconnect }) => {
  const { currentAssetMode } = useAssetMode()

  return (
    <div className={styles.userInfoContainer}>
      <UserGeneralInfo />
      {currentAssetMode === AssetMode.NFT ? <NftLenderVault /> : <TokenLenderVault />}
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
}

interface TooltipRowProps {
  label: string
  value: number
}

export const TooltipRow: FC<TooltipRowProps> = ({ label, value }) => (
  <div className={styles.tooltipRow}>
    <span className={styles.tooltipRowLabel}>{label}</span>
    <span className={styles.tooltipRowValue}>
      <DisplayValue value={value} />
    </span>
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
