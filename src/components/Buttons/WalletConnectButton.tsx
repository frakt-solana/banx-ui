import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { useClusterStats, useDiscordUser, useWalletBalance } from '@banx/hooks'
import { ChevronDown, Wallet } from '@banx/icons'
import { useUserOffers } from '@banx/pages/nftLending/OffersPage/components/OffersTabContent/hooks'
import { useNftTokenType } from '@banx/store/nft'
import { shortenAddress } from '@banx/utils'

import { DisplayValue } from '../TableComponents'
import UserAvatar from '../UserAvatar'
import { getLenderVaultInfo, useWalletModal } from '../WalletModal'
import { Button } from './Button'

import styles from './Buttons.module.less'

export const WalletConnectButton = () => {
  const { toggleVisibility, visible } = useWalletModal()
  const { publicKey, connected } = useWallet()

  const walletPubkeyString = publicKey?.toBase58() || ''

  const { tokenType } = useNftTokenType()

  const walletBalance = useWalletBalance(tokenType, { isLive: true })

  const { data: discordUserData } = useDiscordUser()
  const { data: clusterStats } = useClusterStats()
  const { offers } = useUserOffers()

  const { totalClaimableValue } = getLenderVaultInfo(offers, clusterStats)

  const ConnectedButton = () => (
    <div className={styles.connectedButton} onClick={toggleVisibility}>
      <UserAvatar imageUrl={discordUserData?.avatarUrl ?? undefined} />
      <div className={styles.connectedWalletInfo}>
        <span className={styles.connectedWalletAddress}>{shortenAddress(walletPubkeyString)}</span>
        <span className={styles.connectedMobileWalletAddress}>
          {walletPubkeyString.slice(0, 4)}
        </span>
        <BalanceContent walletBalance={walletBalance} vaultBalance={totalClaimableValue} />
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

interface BalanceContentProps {
  walletBalance: number
  vaultBalance: number
}
const BalanceContent: FC<BalanceContentProps> = ({ walletBalance, vaultBalance }) => {
  return (
    <div className={styles.balanceContent}>
      <span className={styles.balance}>
        <DisplayValue value={walletBalance} />
      </span>

      {!!vaultBalance && (
        <>
          <div className={styles.verticalLine} />
          <span className={styles.banxSolBalance}>
            <DisplayValue value={vaultBalance} />
          </span>
        </>
      )}
    </div>
  )
}
