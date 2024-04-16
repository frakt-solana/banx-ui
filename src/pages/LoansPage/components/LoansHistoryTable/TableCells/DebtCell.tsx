import { FC } from 'react'

import { DisplayValue } from '@banx/components/TableComponents'

import { BorrowerActivity } from '@banx/api/activity'

import styles from '../LoansHistoryTable.module.less'

interface DebtCellrops {
  loan: BorrowerActivity
  isCardView: boolean
}

export const DebtCell: FC<DebtCellrops> = ({ loan, isCardView }) => {
  const { borrowed, interest, currentRemainingLentAmount } = loan || {}

  const lentAmount = currentRemainingLentAmount || borrowed
  const repayValue = lentAmount + interest

  const formattedRepayValue = <DisplayValue value={repayValue} />
  const formattedFeeValue = <DisplayValue value={interest} />

  return !isCardView ? (
    <div className={styles.debtCell}>
      <span className={styles.debtCellTitle}>{formattedRepayValue}</span>
      <span className={styles.debtCellSubtitle}>{formattedFeeValue} fee</span>
    </div>
  ) : (
    <span>
      {formattedRepayValue} ({formattedFeeValue} fee)
    </span>
  )
}
