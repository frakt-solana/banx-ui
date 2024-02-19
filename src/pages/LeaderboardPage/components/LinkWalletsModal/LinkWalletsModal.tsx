import { FC, useEffect } from 'react'

import { Button } from '@banx/components/Buttons'
import Checkbox from '@banx/components/Checkbox'
import { Loader } from '@banx/components/Loader'
import { Modal } from '@banx/components/modals/BaseModal'

import { LinkingInProgressBlock, WalletInfo, WalletsBlock } from './components'
import { useLinkWalletsModal } from './hooks'

import styles from './LinkWalletsModal.module.less'

export const LinkWalletsModal = () => {
  const { onCloseModal, wallet, banxLoginState, savedLinkingState } = useLinkWalletsModal()
  const { checkAccess } = banxLoginState
  const { publicKey } = wallet
  const { savedLinkingData } = savedLinkingState

  useEffect(() => {
    if (!publicKey || savedLinkingData) return
    checkAccess(publicKey)
  }, [publicKey, checkAccess, savedLinkingData])

  return (
    <Modal className={styles.modal} open onCancel={onCloseModal} width={572}>
      <WalletInfo />
      <LinkWalletsModalContent />
    </Modal>
  )
}

const LinkWalletsModalContent = () => {
  const { wallet, banxLoginState, savedLinkingState } = useLinkWalletsModal()
  const { savedLinkingData } = savedLinkingState
  const { connected } = wallet
  const { isLoggedIn } = banxLoginState

  //? Wallet not connected and no linking data (for some reason)
  if (!connected && !savedLinkingData) {
    return <p>Please, connect wallet</p>
  }

  //? Wallet not verified and linking data isnt in progress
  if (connected && !isLoggedIn && !savedLinkingData) {
    return <VerifyWalletBlock />
  }

  return <LinkingBlock />
}

const VerifyWalletBlock: FC = () => {
  const { wallet, ledgerState, onLogin, banxLoginState } = useLinkWalletsModal()
  const { isLedger, setIsLedger } = ledgerState
  const { isLoggedIn, isLoggingIn } = banxLoginState

  if (isLoggingIn) {
    return <Loader />
  }

  return (
    <div>
      {wallet.connected && (
        <>
          <Checkbox
            onChange={() => setIsLedger(!isLedger)}
            label="I use ledger"
            checked={isLedger}
          />
          {!isLoggingIn && !isLoggedIn && <Button onClick={onLogin}>Verify wallet</Button>}
        </>
      )}
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

  if (!savedLinkingData) {
    return <Button onClick={onStartLinking}>Start linking</Button>
  }

  if (savedLinkingData && !wallet.connected) {
    return (
      <>
        <LinkingInProgressBlock onCancel={onCloseModal} />
        <WalletsBlock />
      </>
    )
  }

  if (!isDiffWalletConnected) {
    return (
      <>
        <LinkingInProgressBlock
          onCancel={() => {
            setSavedLinkingData(null)
          }}
        />
        <Button
          onClick={() => {
            wallet.disconnect()
          }}
        >
          Change wallet
        </Button>
      </>
    )
  }

  if (isDiffWalletConnected) {
    return (
      <>
        <LinkingInProgressBlock
          onCancel={() => {
            setSavedLinkingData(null)
          }}
        />
        Add new wallet <pre>{wallet.publicKey?.toBase58()}</pre>
        <Checkbox onChange={() => setIsLedger(!isLedger)} label="I use ledger" checked={isLedger} />
        <Button onClick={onLink}>Link</Button>
      </>
    )
  }
}
