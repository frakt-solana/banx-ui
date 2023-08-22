import { FC } from 'react'

import { createPercentValueJSX, createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'

import styles from '../ActiveOffersTable.module.less'

interface LentCellProps {
  loan: Loan
}

export const LentCell: FC<LentCellProps> = ({ loan }) => {
  const { solAmount, feeAmount } = loan.bondTradeTransaction || {}

  const collectionFloor = loan.nft.collectionFloor

  const lentValue = solAmount + feeAmount
  const LTV = (lentValue / collectionFloor) * 100

  return (
    <div className={styles.lentInfo}>
      <span>{createSolValueJSX(lentValue, 1e9)}</span>
      <span>{createPercentValueJSX(LTV)} LTV</span>
    </div>
  )
}
