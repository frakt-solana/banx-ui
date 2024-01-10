import { FC } from 'react'

import { Button } from '@banx/components/Buttons'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { BONDS } from '@banx/constants'

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
