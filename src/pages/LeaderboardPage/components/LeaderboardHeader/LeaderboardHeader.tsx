import { useWallet } from '@solana/wallet-adapter-react'

import UserAvatar from '@banx/components/UserAvatar'

import { LoyaltyBlock, NoConnectedWalletInfo, ParticipantsInfo, WalletInfo } from './components'

import styles from './LeaderboardHeader.module.less'

const MOCK_AVATAR_URL = 'https://pbs.twimg.com/media/FuaAl7sXoAIm_jk?format=png&name=small'
const MOCK_MULTIPLIER = 57
const MOCK_TOTAL_PARTICIPANTS = 1200

const Header = () => {
  const { publicKey: walletPublicKey } = useWallet()
  const walletPublicKeyString = walletPublicKey?.toBase58() || ''

  return (
    <div className={styles.header}>
      <div className={styles.walletInfoContainer}>
        <UserAvatar
          imageUrl={walletPublicKeyString ? MOCK_AVATAR_URL : ''}
          className={styles.avatar}
        />

        {walletPublicKey ? (
          <WalletInfo walletPublicKey={walletPublicKeyString} />
        ) : (
          <NoConnectedWalletInfo />
        )}
      </div>

      {walletPublicKey ? (
        <LoyaltyBlock multiplier={MOCK_MULTIPLIER} />
      ) : (
        <ParticipantsInfo participants={MOCK_TOTAL_PARTICIPANTS} />
      )}
    </div>
  )
}

export default Header
