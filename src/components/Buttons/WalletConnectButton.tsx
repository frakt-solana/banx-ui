import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { useDiscordUser } from '@banx/hooks'
import { ChevronDown, Wallet } from '@banx/icons'
import { useSeasonUserRewards } from '@banx/pages/LeaderboardPage/hooks'
import { HealthColorDecreasing, getColorByPercent, shortenAddress } from '@banx/utils'

import UserAvatar from '../UserAvatar'
import { useWalletModal } from '../WalletModal'
import { Button } from './Button'

import styles from './Buttons.module.less'

export const WalletConnectButton = () => {
  const { toggleVisibility, visible } = useWalletModal()
  const { publicKey, connected } = useWallet()

  const { data: discordUserData } = useDiscordUser()
  const { data: userRewardsStats } = useSeasonUserRewards()

  const loyalty = userRewardsStats?.loyalty || 0
  const formattedLoyalty = Math.max((loyalty - 1) * 100, 0)

  const loyaltyColor = getColorByPercent(formattedLoyalty, HealthColorDecreasing)

  const ConnectedButton = () => (
    <div className={styles.connectedButton} onClick={toggleVisibility}>
      <UserAvatar imageUrl={discordUserData?.avatarUrl ?? undefined} />
      <div className={styles.connectedWalletInfo}>
        <span className={styles.connectedWalletAddress}>
          {shortenAddress(publicKey?.toBase58() || '')}
        </span>
        <span style={{ color: loyaltyColor }} className={styles.connectedWalletLoyalty}>
          {formattedLoyalty}% loyalty
        </span>
      </div>
      <ChevronDown
        className={classNames(styles.connectedWalletChevron, { [styles.active]: visible })}
      />
    </div>
  )

  const DisconnectedButton = () => (
    <Button onClick={toggleVisibility} className={styles.disconnectedButton}>
      <Wallet className={styles.walletIcon} />
      <span>Connect wallet</span>
    </Button>
  )

  return connected ? <ConnectedButton /> : <DisconnectedButton />
}
