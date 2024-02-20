import { useState } from 'react'

import { Button } from '@banx/components/Buttons'
import Checkbox from '@banx/components/Checkbox'

import { useLinkWalletsModal } from '../hooks'
import { WalletsList } from './WalletsList'

import styles from '../LinkWalletsModal.module.less'

export const LinkingBlock = () => {
  const {
    onCloseModal,
    wallet,
    savedLinkingState,
    onStartLinking,
    onLink,
    isDiffWalletConnected,
    ledgerState,
  } = useLinkWalletsModal()
  const { savedLinkingData, setSavedLinkingData } = savedLinkingState
  const { isLedger, setIsLedger } = ledgerState

  //? For loading state
  const [isLinking, setIsLinking] = useState(false)

  const link = async () => {
    try {
      setIsLinking(true)
      await onLink()
    } finally {
      setIsLinking(false)
    }
  }

  //? Wallet connected and verified. Linking isn't started
  if (!savedLinkingData) {
    return (
      <div className={styles.linkingBlockStart}>
        <Button onClick={onStartLinking}>Start linking</Button>
      </div>
    )
  }

  //? Linking started. First wallet disconnected. New wallet not connected
  if (savedLinkingData && !wallet.connected) {
    return (
      <div className={styles.linkingBlockSelectWallet}>
        <WalletsList />
        <div className={styles.linkingBtns}>
          <Button className={styles.cancelLinkingBtn} onClick={onCloseModal}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  //? Linking started. First wallet connected and verified. New wallet not connected
  if (!isDiffWalletConnected) {
    return (
      <div className={styles.linkingBlockChange}>
        <p className={styles.explanation}>
          Please change wallet in your extension or change extension itself
        </p>
        <div className={styles.linkingBtns}>
          <Button
            className={styles.cancelLinkingBtn}
            onClick={() => {
              setSavedLinkingData(null)
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              wallet.disconnect()
            }}
          >
            Change wallet
          </Button>
        </div>
      </div>
    )
  }

  //? Linking started. First wallet disconnected. New wallet connected
  return (
    <div className={styles.linkingBlockNewWallet}>
      <p className={styles.explanation}>
        Link
        <br />
        {wallet.publicKey?.toBase58()}
      </p>
      <Checkbox onChange={() => setIsLedger(!isLedger)} label="I use ledger" checked={isLedger} />
      <div className={styles.linkingBtns}>
        <Button
          className={styles.cancelLinkingBtn}
          onClick={() => {
            setSavedLinkingData(null)
          }}
        >
          Cancel
        </Button>
        <Button onClick={link} loading={isLinking}>
          Link
        </Button>
      </div>
    </div>
  )
}
