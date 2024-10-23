import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { useWalletBalance } from '@banx/hooks'
import { Escrow, HorizontalDots, Wallet } from '@banx/icons'
import { useTokenType } from '@banx/store/common'

import { DisplayValue } from '../TableComponents'
import { useLenderVaultInfo, useWalletModal } from '../WalletModal'
import { Button } from './Button'

import styles from './Buttons.module.less'

export const WalletConnectButton = () => {
  const { toggleVisibility } = useWalletModal()
  const { publicKey, connected } = useWallet()

  const walletPubkeyString = publicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

  const walletBalance = useWalletBalance(tokenType, { isLive: true })

  const { lenderVaultInfo } = useLenderVaultInfo()

  const ConnectedButton = () => (
    <div className={styles.connectedButton} onClick={toggleVisibility}>
      <BalanceContent
        walletPubkey={walletPubkeyString}
        walletBalance={walletBalance}
        vaultBalance={lenderVaultInfo.offerLiquidityAmount}
      />

      <HorizontalDots className={styles.connectedWalletIcon} />
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
  walletPubkey: string
  walletBalance: number
  vaultBalance: number
}

const BalanceContent: FC<BalanceContentProps> = ({ walletPubkey, walletBalance, vaultBalance }) => {
  return (
    <div className={styles.balanceContent}>
      <div className={styles.balanceInfo}>
        <span className={styles.balanceInfoLabel}>{walletPubkey.slice(0, 4)}:</span>
        <Wallet />
        <span className={styles.balanceInfoValue}>
          <DisplayValue value={walletBalance} />
        </span>
      </div>

      <span className={styles.balanceInfo}>
        <Escrow />
        <span className={styles.balanceInfoLabel}>Escrow:</span>
        <span className={styles.balanceInfoValue}>
          <DisplayValue value={vaultBalance} />
        </span>
      </span>
    </div>
  )
}
