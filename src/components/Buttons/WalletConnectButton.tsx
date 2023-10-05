import { useWallet } from '@solana/wallet-adapter-react'

import { useDiscordUser } from '@banx/hooks'
import { ChevronDown, Wallet } from '@banx/icons'
import { shortenAddress } from '@banx/utils'

import UserAvatar from '../UserAvatar'
import { useWalletModal } from '../WalletModal'
import { Button } from './Button'

import styles from './Buttons.module.less'

export const WalletConnectButton = () => {
  const { toggleVisibility } = useWalletModal()
  const { publicKey, connected } = useWallet()
  const { data: discordUserData } = useDiscordUser()

  const ConnectedContent = () => (
    <>
      <UserAvatar
        className={styles.avatarIcon}
        imageUrl={discordUserData?.avatarUrl ?? undefined}
      />
      <span>{shortenAddress(publicKey?.toBase58() || '')}</span>
      <ChevronDown />
    </>
  )

  const DisconnectedContent = () => (
    <>
      <Wallet className={styles.walletIcon} />
      <span>Connect wallet</span>
    </>
  )

  return (
    <Button
      variant={connected ? 'secondary' : 'primary'}
      onClick={toggleVisibility}
      className={styles.walletConnectButton}
    >
      {connected ? <ConnectedContent /> : <DisconnectedContent />}
    </Button>
  )
}
