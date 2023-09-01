import { FC } from 'react'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { BorrowerActivity } from '@banx/api/core'

import styles from '../LoansHistoryTable.module.less'

interface DebtCellrops {
  loan: BorrowerActivity
}

export const DebtCell: FC<DebtCellrops> = ({ loan }) => {
  const { borrowed, interest } = loan

  const repayValue = borrowed + interest

  return (
    <div className={styles.debtCell}>
      <span className={styles.debtCellTitle}>{createSolValueJSX(repayValue, 1e9, '0◎')}</span>
      <span className={styles.debtCellSubtitle}>{createSolValueJSX(interest, 1e9, '0◎')} fee</span>
    </div>
  )
}
