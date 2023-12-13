import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { createSolValueJSX } from '@banx/components/TableComponents'
import { useWalletModal } from '@banx/components/WalletModal'
import { InputCounter, NumericInputField } from '@banx/components/inputs'

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
        disabled={isOfferCreatedInProMode || mode === OfferMode.Lite}
      >
        Lite
      </Button>
      <Button
        type="circle"
        variant="text"
        className={classNames(styles.switchButton, { [styles.active]: mode === OfferMode.Pro })}
        onClick={() => onChange(OfferMode.Pro)}
        disabled={mode === OfferMode.Pro}
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

interface PlaceOfferFieldsProps {
  loanValue: string
  deltaValue?: string
  loansAmount: string

  onLoanValueChange: (value: string) => void
  onDeltaValueChange?: (value: string) => void
  onLoanAmountChange: (value: string) => void
}

export const PlaceOfferFields: FC<PlaceOfferFieldsProps> = ({
  loanValue,
  deltaValue = '0',
  loansAmount,
  onDeltaValueChange,
  onLoanAmountChange,
  onLoanValueChange,
}) => {
  const { connected } = useWallet()
  const disabled = !connected

  return (
    <div className={styles.fields}>
      <NumericInputField
        label="Max offer"
        value={loanValue}
        onChange={onLoanValueChange}
        className={styles.numericField}
        disabled={disabled}
      />
      {onDeltaValueChange && (
        <NumericInputField
          label="Avg Delta"
          onChange={onDeltaValueChange}
          value={deltaValue}
          disabled={disabled}
          tooltipText="The average difference between loans taken from this pool given 100% utilization. For example: initialOffer: 1 SOL, delta 0.2 SOL, number of offers 2. The loans can be either the max 1, 0.8; or 0.2, 0.4, 0.4, 0,6, 0.1, 0.1. In both cases the average delta is 0.2. And the sum of loans is same"
        />
      )}
      <InputCounter
        label="Number of offers"
        onChange={onLoanAmountChange}
        value={loansAmount}
        disabled={disabled}
      />
    </div>
  )
}
