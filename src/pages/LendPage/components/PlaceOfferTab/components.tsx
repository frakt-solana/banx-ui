import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { capitalize } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { useWalletModal } from '@banx/components/WalletModal'

import { trackPageEvent } from '@banx/utils'

import { OFFER_MODE } from '../ExpandableCardContent'

import styles from './PlaceOfferTab.module.less'

interface OfferHeaderProps {
  isEditMode: boolean
  exitEditMode: () => void
}

export const OfferHeader: FC<OfferHeaderProps> = ({ isEditMode, exitEditMode }) => {
  const title = isEditMode ? 'Offer editing' : 'Offer creation'

  return (
    <div className={styles.offerHeaderContent}>
      <h4 className={styles.title}>{title}</h4>
      {isEditMode && (
        <Button type="circle" variant="text" onClick={exitEditMode}>
          Exit
        </Button>
      )}
    </div>
  )
}

interface OfferActionButtonsProps {
  isEditMode: boolean
  disableUpdateOffer: boolean
  disablePlaceOffer: boolean
  onCreateOffer: () => void
  onRemoveOffer: () => void
  onUpdateOffer: () => void
}

export const OfferActionButtons: FC<OfferActionButtonsProps> = ({
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
    <div className={styles.buttonsWrapper}>
      {isEditMode ? (
        <>
          <Button
            variant="secondary"
            onClick={onRemoveOffer}
            className={classNames(styles.button, styles.deleteOfferButton)}
          >
            Remove
          </Button>
          <Button onClick={onUpdateOffer} className={styles.button} disabled={disableUpdateOffer}>
            Apply changes
          </Button>
        </>
      ) : (
        <Button
          onClick={onMainActionBtnClick}
          className={styles.button}
          disabled={disablePlaceOffer}
        >
          {connected ? 'Place' : 'Connect wallet'}
        </Button>
      )}
    </div>
  )
}

interface SwitchModeButtonsProps {
  mode: OFFER_MODE
  onChange: (value: OFFER_MODE) => void
}

export const SwitchModeButtons: FC<SwitchModeButtonsProps> = ({ mode, onChange }) => {
  const modes = [OFFER_MODE.LITE, OFFER_MODE.PRO]

  return (
    <div className={styles.switchModeButtons}>
      {modes.map((buttonMode) => (
        <Button
          key={buttonMode}
          type="circle"
          variant="text"
          onClick={() => onChange(buttonMode)}
          className={classNames(styles.switchButton, { [styles.active]: mode === buttonMode })}
        >
          {capitalize(buttonMode)}
        </Button>
      ))}
    </div>
  )
}
