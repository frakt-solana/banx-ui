import { FC } from 'react'

import { DisplayValue } from '@banx/components/TableComponents'

import { BONDS } from '@banx/constants'
import { TokenType } from '@banx/store'
import { getTokenDecimals } from '@banx/utils'

import styles from './PlaceOfferSection.module.less'

interface BorrowerMessageProps {
  loanValue: string
  tokenType: TokenType
}

export const BorrowerMessage: FC<BorrowerMessageProps> = ({ loanValue, tokenType }) => {
  const decimals = getTokenDecimals(tokenType)

  const loanValueToNumber = parseFloat(loanValue) || 0
  const loanValueWithProtocolFee =
    (loanValueToNumber - loanValueToNumber * (BONDS.PROTOCOL_FEE_PERCENT / 1e4)) * decimals

  return (
    <p className={styles.borrowerMessage}>
      Borrower sees: {<DisplayValue value={loanValueWithProtocolFee} />}
    </p>
  )
}
