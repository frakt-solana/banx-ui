import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { createSolValueJSX } from '@banx/components/TableComponents'
import { useWalletModal } from '@banx/components/WalletModal'
import { InputErrorMessage } from '@banx/components/inputs'

import { BONDS, WEEKS_IN_YEAR } from '@banx/constants'
import {
  HealthColorIncreasing,
  getColorByPercent,
  getDecimalPlaces,
  trackPageEvent,
} from '@banx/utils'

import styles from './PlaceOfferTab.module.less'

interface OfferSummaryProps {
  offerSize: number
  marketAPR: number
  loanToValuePercent: number
}

export const OfferSummary: FC<OfferSummaryProps> = ({
  offerSize,
  marketAPR,
  loanToValuePercent,
}) => {
  const weeklyAprPercentage = marketAPR / 100 / WEEKS_IN_YEAR
  const estimatedInterest = (offerSize * weeklyAprPercentage) / 100

  const colorLTV = getColorByPercent(loanToValuePercent, HealthColorIncreasing)

  return (
    <div className={styles.offerSummary}>
      <StatInfo
        label="LTV"
        value={loanToValuePercent}
        valueStyles={{ color: colorLTV }}
        flexType="row"
        valueType={VALUES_TYPES.PERCENT}
      />
      <StatInfo
        label="Offer size"
        value={offerSize}
        flexType="row"
        decimalPlaces={getDecimalPlaces(offerSize)}
      />
      <StatInfo label="Weekly interest" value={estimatedInterest} flexType="row" />
    </div>
  )
}

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

interface OfferMessages {
  showDepositErrorMessage: boolean
  showBorrowerMessage: boolean
  loanValue: string
}

export const OfferMessages: FC<OfferMessages> = ({
  showDepositErrorMessage,
  showBorrowerMessage,
  loanValue,
}) => {
  const loanValueToNumber = parseFloat(loanValue) || 0
  const loanValueWithProtocolFee =
    loanValueToNumber - loanValueToNumber * (BONDS.PROTOCOL_FEE_PERCENT / 1e4)

  return (
    <div className={styles.messageContainer}>
      {showBorrowerMessage && (
        <p className={styles.borrowerMessage}>
          Borrower sees: {createSolValueJSX(loanValueWithProtocolFee)}
        </p>
      )}
      {showDepositErrorMessage && <InputErrorMessage message="Not enough SOL" />}
    </div>
  )
}
