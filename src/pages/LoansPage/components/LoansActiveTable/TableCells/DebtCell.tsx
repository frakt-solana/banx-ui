import { FC } from 'react'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { calculateLoanRepayValue } from '@banx/utils'

import styles from '../LoansActiveTable.module.less'

interface DebtCellProps {
  loan: Loan
  isCardView: boolean
}

export const DebtCell: FC<DebtCellProps> = ({ loan, isCardView }) => {
  const repayValue = calculateLoanRepayValue(loan)

  const fee = repayValue - loan.bondTradeTransaction.solAmount

  const formattedRepayValue = createSolValueJSX(repayValue, 1e9, '0◎')
  const formattedFeeValue = createSolValueJSX(fee, 1e9, '0◎')

  return !isCardView ? (
    <div className={styles.debtInfo}>
      <span className={styles.debtInfoTitle}>{formattedRepayValue}</span>
      <span className={styles.debtInfoSubtitle}>{formattedFeeValue} fee</span>
    </div>
  ) : (
    <span>
      {formattedRepayValue} ({formattedFeeValue} fee)
    </span>
  )
}
