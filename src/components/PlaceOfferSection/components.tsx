import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { Offer } from '@banx/api/core'
import { BONDS } from '@banx/constants'

import { OfferMode } from '../../pages/LendPage/components/ExpandableCardContent'

import styles from './PlaceOfferSection.module.less'

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
