import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { USDC_ADDRESS } from '@banx/constants'
import { useDiscordUser } from '@banx/hooks'
import { ChevronDown, Wallet } from '@banx/icons'
import { useToken } from '@banx/store'
import {
  isSolLendingTokenType,
  isUsdcLendingTokenType,
  shortenAddress,
  useSolanaBalance,
  useTokenBalance,
} from '@banx/utils'

import { DisplayValue } from '../TableComponents'
import UserAvatar from '../UserAvatar'
import { useWalletModal } from '../WalletModal'
import { Button } from './Button'

import styles from './Buttons.module.less'

export const WalletConnectButton = () => {
  const { toggleVisibility, visible } = useWalletModal()
  const { publicKey, connected } = useWallet()

  const { data: discordUserData } = useDiscordUser()

  const { token: tokenType } = useToken()

  const solanaBalance = useSolanaBalance({ isLive: isSolLendingTokenType(tokenType) })
  const usdcBalance = useTokenBalance(USDC_ADDRESS, { isLive: isUsdcLendingTokenType(tokenType) })

  const ConnectedButton = () => (
    <div className={styles.connectedButton} onClick={toggleVisibility}>
      <UserAvatar imageUrl={discordUserData?.avatarUrl ?? undefined} />
      <div className={styles.connectedWalletInfo}>
        <span className={styles.connectedWalletAddress}>
          {shortenAddress(publicKey?.toBase58() || '')}
        </span>
        <span className={styles.solanaBalance}>
          {tokenType === LendingTokenType.NativeSol && <DisplayValue value={solanaBalance} />}
          {tokenType === LendingTokenType.Usdc && <DisplayValue value={usdcBalance} />}
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
