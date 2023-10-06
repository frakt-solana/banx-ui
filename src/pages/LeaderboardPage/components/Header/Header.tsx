import { useWallet } from '@solana/wallet-adapter-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@banx/components/Buttons'
import Tooltip from '@banx/components/Tooltip'

import { PATHS } from '@banx/router'
import { shortenAddress } from '@banx/utils'

import styles from './Header.module.less'

const MOCK_AVATAR_URL = 'https://pbs.twimg.com/media/FuaAl7sXoAIm_jk?format=png&name=small'
const MOCK_MULTIPLIER = 57

const Header = () => {
  const { publicKey: walletPublicKey } = useWallet()

  return (
    <div className={styles.header}>
      <div className={styles.walletInfoContainer}>
        <Avatar imageUrl={MOCK_AVATAR_URL} />
        <WalletInfo walletPublicKey={walletPublicKey?.toBase58() || ''} />
      </div>
      <LoyaltyBlock />
    </div>
  )
}

export default Header

const Avatar = ({ imageUrl }: { imageUrl: string }) => (
  <img src={imageUrl} className={styles.avatar} />
)

const WalletInfo = ({ walletPublicKey }: { walletPublicKey: string }) => (
  <div className={styles.walletInfo}>
    <span className={styles.walletAddress}>{shortenAddress(walletPublicKey)}</span>
    <Button className={styles.connectWalletButton} variant="secondary" size="small">
      Link wallets
    </Button>
  </div>
)

const LoyaltyBlock = () => {
  const navigate = useNavigate()
  const goToAdventurePage = () => {
    navigate(PATHS.ADVENTURES)
  }

  return (
    <div className={styles.loyaltyContainer}>
      <div className={styles.loyaltyInfoWrapper}>
        <LoyaltyInfo multiplier={MOCK_MULTIPLIER} />
        <Button
          onClick={goToAdventurePage}
          className={styles.stakeBanxButton}
          variant="secondary"
          size="small"
        >
          Stake Banx
        </Button>
      </div>
    </div>
  )
}

const LoyaltyInfo = ({ multiplier }: { multiplier: number }) => (
  <div className={styles.loyaltyInfo}>
    <span className={styles.loyaltyMultiplier}>{multiplier}x</span>
    <div className={styles.loyaltyDetails}>
      <span className={styles.loyaltyTitle}>
        Boost <Tooltip title="Boost" />
      </span>
      <span className={styles.loyaltySubtitle}>Want to increase your boost?</span>
    </div>
  </div>
)
