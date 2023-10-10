import { useWallet } from '@solana/wallet-adapter-react'

import UserAvatar from '@banx/components/UserAvatar'

import { useDiscordUser } from '@banx/hooks'

import { useSeasonUserRewards } from '../../hooks'
import { LoyaltyBlock, NoConnectedWalletInfo, ParticipantsInfo, WalletInfo } from './components'

import styles from './LeaderboardHeader.module.less'

const Header = () => {
  const { publicKey: walletPublicKey } = useWallet()
  const walletPublicKeyString = walletPublicKey?.toBase58() || ''

  const { data } = useSeasonUserRewards()
  const { loyalty = 0, playerPoints = 0, totalParticipants = 0 } = data || {}

  const { data: discordUserData } = useDiscordUser()

  return (
    <div className={styles.header}>
      <div className={styles.walletInfoContainer}>
        <UserAvatar imageUrl={discordUserData?.avatarUrl ?? ''} className={styles.avatar} />

        {walletPublicKey ? (
          <WalletInfo walletPublicKey={walletPublicKeyString} />
        ) : (
          <NoConnectedWalletInfo />
        )}
      </div>

      {walletPublicKey ? (
        <LoyaltyBlock multiplier={playerPoints} loyalty={loyalty} />
      ) : (
        <ParticipantsInfo participants={totalParticipants} />
      )}
    </div>
  )
}

export default Header
