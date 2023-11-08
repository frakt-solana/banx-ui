import { FC } from 'react'

import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { createPercentValueJSX, createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { BONDS, SECONDS_IN_HOUR } from '@banx/constants'
import {
  LoanStatus,
  STATUS_LOANS_COLOR_MAP,
  STATUS_LOANS_MAP,
  convertAprToApy,
  formatDecimal,
} from '@banx/utils'

import styles from '../LoansActiveTable.module.less'

interface InterestCellProps {
  loan: Loan
  isCardView: boolean
}

export const InterestCell: FC<InterestCellProps> = ({ loan, isCardView }) => {
  const { solAmount, feeAmount, soldAt, amountOfBonds } = loan.bondTradeTransaction || {}

  const loanValueWithFee = solAmount + feeAmount

  const statusText = STATUS_LOANS_MAP[loan.bondTradeTransaction.bondTradeTransactionState] || ''
  const statusColor = STATUS_LOANS_COLOR_MAP[statusText as LoanStatus] || ''

  const weeklyFee = calculateCurrentInterestSolPure({
    loanValue: loanValueWithFee,
    startTime: soldAt,
    currentTime: soldAt + SECONDS_IN_HOUR * 24 * 7,
    rateBasePoints: amountOfBonds + BONDS.PROTOCOL_REPAY_FEE,
  })

  const apy = convertAprToApy(amountOfBonds / 1e4)

  const formattedFeeValue = createSolValueJSX(weeklyFee, 1e9, '0◎', formatDecimal)
  const formattedApyValue = createPercentValueJSX(apy)

  return !isCardView ? (
    <div className={styles.interestInfo}>
      <span className={styles.interestInfoTitle}>{formattedFeeValue} weekly</span>
      <span style={{ color: statusColor }} className={styles.interestInfoSubtitle}>
        {formattedApyValue} APY
      </span>
    </div>
  ) : (
    <span>
      {formattedFeeValue} weekly ({formattedApyValue} APY)
    </span>
  )
}
