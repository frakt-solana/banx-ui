import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { useWalletModal } from '@banx/components/WalletModal'

import { trackPageEvent } from '@banx/utils'

import styles from '../PlaceOfferContent.module.less'

interface ActionButtonsProps {
  isEditMode: boolean
  disableUpdateOffer: boolean
  disablePlaceOffer: boolean
  onCreateOffer: () => void
  onRemoveOffer: () => void
  onUpdateOffer: () => void
}

export const ActionsButtons: FC<ActionButtonsProps> = ({
  isEditMode,
  disableUpdateOffer,
  disablePlaceOffer,
  onCreateOffer,
  onRemoveOffer,
  onUpdateOffer,
}) => {
  const { connected } = useWallet()
  const { toggleVisibility } = useWalletModal()

  const onToggleWalletModal = () => toggleVisibility()

  const onMainActionBtnClick = () => {
    if (connected) {
      return onCreateOffer()
    }
    trackPageEvent('lend', `connectwallet`)
    onToggleWalletModal()
  }

  return (
    <div className={styles.actionsButtonsContainer}>
      {isEditMode ? (
        <div className={styles.editModeContainer}>
          <div className={styles.editModeButtonsContainer}>
            <Button
              variant="secondary"
              onClick={onRemoveOffer}
              className={classNames(styles.actionButton, styles.removeOfferButton)}
            >
              Remove
            </Button>
            <Button
              onClick={onUpdateOffer}
              className={styles.actionButton}
              disabled={disableUpdateOffer}
            >
              Apply changes
            </Button>
          </div>
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
