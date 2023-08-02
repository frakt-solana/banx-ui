import { useWallet } from '@solana/wallet-adapter-react'

import { ChevronDown, Wallet } from '@frakt/icons'
import { shortenAddress } from '@frakt/utils'

import UserAvatar from '../UserAvatar'
import { useWalletModal } from '../WalletModal'
import { Button } from './Button'

import styles from './Buttons.module.less'

export const WalletConnectButton = () => {
  const { toggleVisibility } = useWalletModal()
  const { publicKey, connected } = useWallet()

  const ConnectedContent = () => (
    <>
      <UserAvatar />
      <span>{shortenAddress(publicKey?.toBase58() || '')}</span>
      <ChevronDown className={styles.primaryIcon} />
    </>
  )

  const DisconnectedContent = () => (
    <>
      <Wallet />
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
