import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { ArrowDown, ChevronDown } from '@frakt/icons'

import { useWalletModal } from '../WalletModal'
import { Button } from './Button'

// import { useWalletModal } from '@frakt/components/WalletModal'
// import { shortenAddress } from '@frakt/utils/solanaUtils'
import styles from './Buttons.module.less'

export const ConnectButton: FC = () => {
  const { toggleVisibility } = useWalletModal()
  const { publicKey, connected } = useWallet()

  return (
    <Button
      type="secondary"
      className={styles.container}
      size="large"
      icon={<ChevronDown />}
      onClick={() => toggleVisibility()}
    >
      {connected && (
        <>
          Bt9v...1Se8
          {/* {shortenAddress(walletPubKey?.toString())} */}
        </>
      )}
      {!connected && 'Connect Wallet'}
    </Button>
  )
}
