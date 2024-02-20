import { FC, useEffect, useState } from 'react'

import { Button } from '@banx/components/Buttons'
import Checkbox from '@banx/components/Checkbox'
import { Loader } from '@banx/components/Loader'
import { Modal } from '@banx/components/modals/BaseModal'

import { LinkedWalletsList, WalletsBlock } from './components'
import { useLinkWalletsModal } from './hooks'

import styles from './LinkWalletsModal.module.less'

export const LinkWalletsModal = () => {
  const {
    onCloseModal,
    wallet,
    banxLoginState,
    savedLinkingState,
    linkedWalletsData,
    isDiffWalletConnected,
    isLoading,
  } = useLinkWalletsModal()
  const { checkAccess } = banxLoginState
  const { publicKey } = wallet
  const { savedLinkingData } = savedLinkingState

  //? Check jwt token validity
  useEffect(() => {
    if (!publicKey || savedLinkingData) return
    checkAccess(publicKey)
  }, [publicKey, checkAccess, savedLinkingData])

  //? Don't allow to link wallet if it's already in this wallet group
  useEffect(() => {
    if (
      !publicKey ||
      !linkedWalletsData ||
      !savedLinkingState.savedLinkingData ||
      !isDiffWalletConnected
    ) {
      return
    }

    const walletAlreadyLinked = linkedWalletsData.some(
      ({ wallet }) => wallet === publicKey.toBase58(),
    )

    if (walletAlreadyLinked) {
      savedLinkingState.setSavedLinkingData(null)
    }
  }, [publicKey, linkedWalletsData, savedLinkingState, isDiffWalletConnected])

  return (
    <Modal className={styles.modal} open onCancel={onCloseModal} width={572}>
      {!!isLoading && <Loader />}
      {!isLoading && (
        <>
          <LinkedWalletsList />
          <div className={styles.linkWalletsActionContainer}>
            <LinkWalletsAction />
          </div>
        </>
      )}
    </Modal>
  )
}

const LinkWalletsAction = () => {
  const { wallet, banxLoginState, savedLinkingState } = useLinkWalletsModal()
  const { savedLinkingData } = savedLinkingState
  const { connected } = wallet
  const { isLoggedIn } = banxLoginState

  //? Wallet not connected and no linking data (for some reason)
  if (!connected && !savedLinkingData) {
    return <p className={styles.explanation}>Please, connect wallet</p>
  }

  //? Wallet not verified and linking data isnt in progress
  if (connected && !isLoggedIn && !savedLinkingData) {
    return <VerifyWalletBlock />
  }

  return <LinkingBlock />
}

const VerifyWalletBlock: FC = () => {
  const { ledgerState, onLogin, banxLoginState } = useLinkWalletsModal()
  const { isLedger, setIsLedger } = ledgerState
  const { isLoggingIn } = banxLoginState

  const [loggingStarted, setLoggingStarted] = useState(false)

  const login = async () => {
    try {
      setLoggingStarted(true)
      await onLogin()
    } finally {
      setLoggingStarted(false)
    }
  }

  const isLoading = isLoggingIn || loggingStarted

  return (
    <div className={styles.verifyWalletBlock}>
      <p className={styles.explanation}>Verify wallet to start linking</p>
      <Checkbox onChange={() => setIsLedger(!isLedger)} label="I use ledger" checked={isLedger} />
      <Button onClick={login} loading={isLoading}>
        Verify wallet
      </Button>
    </div>
  )
}

const LinkingBlock = () => {
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

  if (!savedLinkingData) {
    return (
      <div className={styles.linkingBlockStart}>
        <Button onClick={onStartLinking}>Start linking</Button>
      </div>
    )
  }

  if (savedLinkingData && !wallet.connected) {
    return (
      <div className={styles.linkingBlockSelectWallet}>
        <WalletsBlock />
        <div className={styles.linkingBtns}>
          <Button className={styles.cancelLinkingBtn} onClick={onCloseModal}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

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
