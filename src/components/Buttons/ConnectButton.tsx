import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { ChevronDown } from '@frakt/icons'
import { shortenAddress } from '@frakt/utils'

import { useWalletModal } from '../WalletModal'
import { Button } from './Button'

import styles from './Buttons.module.less'

export const ConnectButton: FC = () => {
  const { toggleVisibility } = useWalletModal()
  const { publicKey, connected } = useWallet()

  return (
    <Button type="secondary" onClick={toggleVisibility} className={styles.container}>
      {connected && (
        <>
          {shortenAddress(publicKey?.toBase58() || '')}
          <ChevronDown />
        </>
      )}
      {!connected && 'Connect Wallet'}
    </Button>
  )
}
