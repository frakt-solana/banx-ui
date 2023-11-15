import { FC } from 'react'

import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { createPercentValueJSX, createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { BONDS, SECONDS_IN_DAY } from '@banx/constants'
import {
  LoanStatus,
  STATUS_LOANS_COLOR_MAP,
  STATUS_LOANS_MAP,
  calcLoanBorrowedAmount,
  formatDecimal,
} from '@banx/utils'

import styles from '../LoansActiveTable.module.less'

interface InterestCellProps {
  loan: Loan
  isCardView: boolean
}

export const InterestCell: FC<InterestCellProps> = ({ loan, isCardView }) => {
  const { soldAt, amountOfBonds } = loan.bondTradeTransaction || {}

  const statusText = STATUS_LOANS_MAP[loan.bondTradeTransaction.bondTradeTransactionState] || ''
  const statusColor = STATUS_LOANS_COLOR_MAP[statusText as LoanStatus] || ''

  const currentLoanBorrowedAmount = calcLoanBorrowedAmount(loan)
  const weeklyFee = calculateCurrentInterestSolPure({
    loanValue: currentLoanBorrowedAmount,
    startTime: soldAt,
    currentTime: soldAt + SECONDS_IN_DAY * 7,
    rateBasePoints: amountOfBonds + BONDS.PROTOCOL_REPAY_FEE,
  })

  const aprInPercent = amountOfBonds / 100

  const formattedFeeValue = createSolValueJSX(weeklyFee, 1e9, '0◎', formatDecimal)
  const formattedAprValue = createPercentValueJSX(aprInPercent)

  return !isCardView ? (
    <div className={styles.interestInfo}>
      <span className={styles.interestInfoTitle}>{formattedFeeValue} weekly</span>
      <span style={{ color: statusColor }} className={styles.interestInfoSubtitle}>
        {formattedAprValue} APR
      </span>
    </div>
  ) : (
    <span>
      {formattedFeeValue} weekly ({formattedAprValue} APR)
    </span>
  )
}
