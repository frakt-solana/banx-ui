import { FC } from 'react'

import { createPercentValueJSX, createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'

import styles from '../ActiveOffersTable.module.less'

interface LentCellProps {
  loan: Loan
}

export const LentCell: FC<LentCellProps> = ({ loan }) => {
  const lentValue = 10
  const LTV = 10

  return (
    <div className={styles.lentInfo}>
      <span>{createSolValueJSX(lentValue)}</span>
      <span>{createPercentValueJSX(LTV)}</span>
    </div>
  )
}
