import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { BN } from 'fbonds-core'

import { Button } from '@banx/components/Buttons'
import { useUserVault, useWalletModal } from '@banx/components/WalletModal'

import { useModal } from '@banx/store/common'

import { WarningModal } from './WarningModal'

import styles from '../PlaceTokenOfferSection.module.less'

interface ActionButtonsProps {
  isEditMode: boolean
  disableUpdateOffer: boolean
  disablePlaceOffer: boolean
  onCreateOffer: (amount?: BN) => void
  onUpdateOffer: (amount?: BN) => void
  onRemoveOffer: () => void
  offerSize: number
}

export const ActionsButtons: FC<ActionButtonsProps> = ({
  isEditMode,
  disableUpdateOffer,
  disablePlaceOffer,
  onCreateOffer,
  onRemoveOffer,
  onUpdateOffer,
  offerSize,
}) => {
  const { connected } = useWallet()
  const { toggleVisibility } = useWalletModal()

  const { open: openModal } = useModal()
  const { userVault } = useUserVault()

  const escrowBalance = userVault?.offerLiquidityAmount.toNumber() || 0

  const onSubmitModalAction = (amount?: BN) => {
    if (isEditMode) return onUpdateOffer(amount)
    return onCreateOffer(amount)
  }

  const openWarningModal = () => {
    openModal(WarningModal, { escrowBalance, onSubmit: onSubmitModalAction, offerSize })
  }

  const showWarningModal = offerSize > escrowBalance

  const onMainActionBtnClick = () => {
    if (showWarningModal) {
      return openWarningModal()
    }

    if (connected) {
      return onCreateOffer()
    }

    return toggleVisibility()
  }

  const onUpdateActionBtnClick = () => {
    if (showWarningModal) {
      return openWarningModal()
    }

    return onUpdateOffer()
  }

  return (
    <div className={styles.actionsButtonsContainer}>
      {isEditMode ? (
        <div className={styles.editModeButtons}>
          <Button
            variant="secondary"
            onClick={onRemoveOffer}
            className={classNames(styles.actionButton, styles.removeOfferButton)}
          >
            Remove
          </Button>
          <Button
            onClick={onUpdateActionBtnClick}
            className={styles.actionButton}
            disabled={disableUpdateOffer}
          >
            Apply changes
          </Button>
        </div>
      ) : (
        <Button
          className={styles.placeOfferButton}
          onClick={onMainActionBtnClick}
          disabled={connected ? disablePlaceOffer : false}
        >
          {connected ? 'Place' : 'Connect wallet'}
        </Button>
      )}
    </div>
  )
}
