import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { createSolValueJSX } from '@banx/components/TableComponents'
import { useWalletModal } from '@banx/components/WalletModal'

import { Offer } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { trackPageEvent } from '@banx/utils'

import { OfferMode } from '../ExpandableCardContent'

import styles from './PlaceOfferTab.module.less'

interface OfferHeaderProps {
  isEditMode: boolean
  exitEditMode: () => void
}

export const OfferHeader: FC<OfferHeaderProps> = ({ isEditMode, exitEditMode }) => {
  const title = isEditMode ? 'Offer editing' : 'Offer creation'

  return (
    <div className={styles.offerHeaderContent}>
      <h4 className={styles.offerHeaderTitle}>{title}</h4>
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
  disableClaimInterest: boolean
  onCreateOffer: () => void
  onRemoveOffer: () => void
  onUpdateOffer: () => void
  onClaimOfferInterest: () => void
}

export const OfferActionButtons: FC<OfferActionButtonsProps> = ({
  isEditMode,
  disableUpdateOffer,
  disablePlaceOffer,
  disableClaimInterest,
  onCreateOffer,
  onRemoveOffer,
  onUpdateOffer,
  onClaimOfferInterest,
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
              className={classNames(styles.actionButton, styles.deleteOfferButton)}
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
          <Button
            onClick={onClaimOfferInterest}
            className={styles.actionButton}
            disabled={disableClaimInterest}
          >
            Claim interest
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

interface SwitchModeButtonsProps {
  mode: OfferMode
  onChange: (value: OfferMode) => void
  offer: Offer | undefined
}

export const SwitchModeButtons: FC<SwitchModeButtonsProps> = ({ mode, onChange, offer }) => {
  const isOfferCreatedInProMode = !!offer?.bondingCurve.delta

  return (
    <div className={styles.switchModeButtons}>
      <Button
        type="circle"
        variant="text"
        className={classNames(
          styles.switchButton,
          { [styles.active]: mode === OfferMode.Lite },
          { [styles.disabled]: isOfferCreatedInProMode },
        )}
        onClick={() => onChange(OfferMode.Lite)}
        disabled={isOfferCreatedInProMode}
      >
        Lite
      </Button>
      <Button
        type="circle"
        variant="text"
        className={classNames(styles.switchButton, { [styles.active]: mode === OfferMode.Pro })}
        onClick={() => onChange(OfferMode.Pro)}
      >
        Pro
      </Button>
    </div>
  )
}

interface BorrowerMessageProps {
  loanValue: string
}

export const BorrowerMessage: FC<BorrowerMessageProps> = ({ loanValue }) => {
  const loanValueToNumber = parseFloat(loanValue) || 0
  const loanValueWithProtocolFee =
    loanValueToNumber - loanValueToNumber * (BONDS.PROTOCOL_FEE_PERCENT / 1e4)

  return (
    <p className={styles.borrowerMessage}>
      Borrower sees: {createSolValueJSX(loanValueWithProtocolFee)}
    </p>
  )
}
