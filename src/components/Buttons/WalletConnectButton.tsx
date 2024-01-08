import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { useDiscordUser } from '@banx/hooks'
import { ChevronDown, Wallet } from '@banx/icons'
import {
  formatDecimal,
  formatNumbersWithCommas,
  shortenAddress,
  useSolanaBalance,
} from '@banx/utils'

import UserAvatar from '../UserAvatar'
import { useWalletModal } from '../WalletModal'
import { Button } from './Button'

import styles from './Buttons.module.less'

export const WalletConnectButton = () => {
  const { toggleVisibility, visible } = useWalletModal()
  const { publicKey, connected } = useWallet()

  const { data: discordUserData } = useDiscordUser()
  const solanaBalance = useSolanaBalance()

  const ConnectedButton = () => (
    <div className={styles.connectedButton} onClick={toggleVisibility}>
      <UserAvatar imageUrl={discordUserData?.avatarUrl ?? undefined} />
      <div className={styles.connectedWalletInfo}>
        <span className={styles.connectedWalletAddress}>
          {shortenAddress(publicKey?.toBase58() || '')}
        </span>
        <span className={styles.solanaBalance}>{`${formatBalance(solanaBalance)}◎`}</span>
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

const THRESHOLD_LARGE_BALANCE = 1000
const formatBalance = (balance = 0) => {
  if (!balance) return '0.00'

  if (balance > THRESHOLD_LARGE_BALANCE) {
    return formatNumbersWithCommas(balance.toFixed(0))
  }

  const formattedDecimalValue = formatDecimal(balance)
  return formattedDecimalValue.replace(/\.?0+$/, '')
}
