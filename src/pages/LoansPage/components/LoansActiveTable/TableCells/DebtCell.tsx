import { FC } from 'react'

import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'

import styles from '../LoansTable.module.less'

export const DebtCell: FC<{ loan: Loan }> = ({ loan }) => {
  const { solAmount, soldAt, amountOfBonds } = loan.bondTradeTransaction || {}

  const calculatedInterest = calculateCurrentInterestSolPure({
    loanValue: solAmount,
    startTime: soldAt,
    currentTime: moment().unix(),
    rateBasePoints: amountOfBonds,
  })

  const repayValue = solAmount + calculatedInterest

  const borrowedValue = loan.fraktBond.borrowedAmount
  const fee = repayValue - borrowedValue

  return (
    <div className={styles.debtInfo}>
      <span className={styles.debtInfoTitle}>{createSolValueJSX(repayValue, 1e9)}</span>
      <span className={styles.debtInfoSubtitle}>{createSolValueJSX(fee, 1e9)} fee</span>
    </div>
  )
}
