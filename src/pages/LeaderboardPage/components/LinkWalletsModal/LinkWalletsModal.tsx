import { useEffect } from 'react'

import { Loader } from '@banx/components/Loader'
import { Modal } from '@banx/components/modals/BaseModal'

import { TABLET_WIDTH } from '@banx/constants'
import { useWindowSize } from '@banx/hooks'

import { LinkedWalletsList, LinkingBlock, VerifyWalletBlock } from './components'
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
          <div className={styles.linkWalletsControlsContainer}>
            <LinkWalletsControls />
          </div>
        </>
      )}
    </Modal>
  )
}

const LinkWalletsControls = () => {
  const { wallet, banxLoginState, savedLinkingState } = useLinkWalletsModal()
  const { savedLinkingData } = savedLinkingState
  const { connected } = wallet
  const { isLoggedIn } = banxLoginState

  const { width } = useWindowSize()
  const isMobile = width <= TABLET_WIDTH

  //? Wallet connect doesn't work for mobile devices
  if (isMobile) {
    return <p className={styles.explanation}>You can manage your wallets only from Desktop</p>
  }

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
