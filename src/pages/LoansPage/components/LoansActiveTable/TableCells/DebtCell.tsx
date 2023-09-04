import { FC } from 'react'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { calculateLoanRepayValue } from '@banx/utils'

import styles from '../LoansActiveTable.module.less'

export const DebtCell: FC<{ loan: Loan }> = ({ loan }) => {
  const repayValue = calculateLoanRepayValue(loan)

  const borrowedValue = loan.fraktBond.borrowedAmount
  const fee = repayValue - borrowedValue

  return (
    <div className={styles.debtInfo}>
      <span className={styles.debtInfoTitle}>{createSolValueJSX(repayValue, 1e9)}</span>
      <span className={styles.debtInfoSubtitle}>{createSolValueJSX(fee, 1e9)} fee</span>
    </div>
  )
}
