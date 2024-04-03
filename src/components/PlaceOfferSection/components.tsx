import { FC } from 'react'

import { DisplayValue } from '@banx/components/TableComponents'

import { BONDS } from '@banx/constants'

import styles from './PlaceOfferSection.module.less'

interface BorrowerMessageProps {
  loanValue: string
}

export const BorrowerMessage: FC<BorrowerMessageProps> = ({ loanValue }) => {
  const loanValueToNumber = parseFloat(loanValue) || 0
  const loanValueWithProtocolFee =
    (loanValueToNumber - loanValueToNumber * (BONDS.PROTOCOL_FEE_PERCENT / 1e4)) * 1e9

  return (
    <p className={styles.borrowerMessage}>
      Borrower sees: {<DisplayValue value={loanValueWithProtocolFee} />}
    </p>
  )
}
