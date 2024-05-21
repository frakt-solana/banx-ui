import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { useDiscordUser, useWalletBalance } from '@banx/hooks'
import { ChevronDown, Wallet } from '@banx/icons'
import { useTokenType } from '@banx/store/nft'
import { shortenAddress } from '@banx/utils'

import { DisplayValue } from '../TableComponents'
import UserAvatar from '../UserAvatar'
import { useWalletModal } from '../WalletModal'
import { Button } from './Button'

import styles from './Buttons.module.less'

export const WalletConnectButton = () => {
  const { toggleVisibility, visible } = useWalletModal()
  const { publicKey, connected } = useWallet()

  const walletPubkeyString = publicKey?.toBase58() || ''

  const { data: discordUserData } = useDiscordUser()

  const { tokenType } = useTokenType()

  const walletBalance = useWalletBalance(tokenType, { isLive: true })

  const ConnectedButton = () => (
    <div className={styles.connectedButton} onClick={toggleVisibility}>
      <UserAvatar imageUrl={discordUserData?.avatarUrl ?? undefined} />
      <div className={styles.connectedWalletInfo}>
        <span className={styles.connectedWalletAddress}>{shortenAddress(walletPubkeyString)}</span>
        <span className={styles.connectedMobileWalletAddress}>
          {walletPubkeyString.slice(0, 4)}
        </span>
        <span className={styles.solanaBalance}>
          <DisplayValue value={walletBalance} />
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
