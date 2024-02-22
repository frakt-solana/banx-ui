import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { sumBy } from 'lodash'

import UserAvatar from '@banx/components/UserAvatar'

import { useDiscordUser } from '@banx/hooks'

import { useLinkedWallets, useSeasonUserRewards } from '../../hooks'
import { LoyaltyBlock, NoConnectedWalletInfo, ParticipantsInfo, WalletInfo } from './components'

import styles from './LeaderboardHeader.module.less'

const Header = () => {
  const { publicKey: walletPublicKey } = useWallet()
  const walletPublicKeyString = walletPublicKey?.toBase58() || ''

  const { data: userRewardsData, isLoading: userRewardsDataLoading } = useSeasonUserRewards()
  const { loyalty = 0, playerPoints = 0, totalParticipants = 0 } = userRewardsData || {}

  const { linkedWallets, isLoading: linkedWalletsLoading } = useLinkedWallets()

  const { lenderPoints, borrowerPoints } = useMemo(() => {
    if (!linkedWallets || !linkedWallets.length) {
      return { lenderPoints: 0, borrowerPoints: 0 }
    }

    return {
      lenderPoints: sumBy(linkedWallets, ({ lenderPoints }) => lenderPoints),
      borrowerPoints: sumBy(linkedWallets, ({ borrowerPoints }) => borrowerPoints),
    }
  }, [linkedWallets])

  const { data: discordUserData } = useDiscordUser()

  const showLoyaltyBlock = !!walletPublicKey && !linkedWalletsLoading && !userRewardsDataLoading

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

      {showLoyaltyBlock ? (
        <LoyaltyBlock
          multiplier={playerPoints}
          loyalty={loyalty}
          lenderPoints={lenderPoints}
          borrowerPoints={borrowerPoints}
        />
      ) : (
        <ParticipantsInfo participants={totalParticipants} />
      )}
    </div>
  )
}

export default Header
