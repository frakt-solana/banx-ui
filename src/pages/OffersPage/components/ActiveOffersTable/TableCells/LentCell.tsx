import { FC } from 'react'

import { createPercentValueJSX, createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { ColorByPercentHealth, getColorByPercent } from '@banx/utils'

import styles from '../ActiveOffersTable.module.less'

interface LentCellProps {
  loan: Loan
}

export const LentCell: FC<LentCellProps> = ({ loan }) => {
  const { solAmount, feeAmount } = loan.bondTradeTransaction || {}

  const collectionFloor = loan.nft.collectionFloor

  const lentValue = solAmount + feeAmount
  const LTV = (lentValue / collectionFloor) * 100

  const colorLTV = getColorByPercent(LTV, ColorByPercentHealth)

  return (
    <div className={styles.lentInfo}>
      <span>{createSolValueJSX(lentValue, 1e9)}</span>
      <span className={styles.lentInfoSubtitle} style={{ color: colorLTV }}>
        {createPercentValueJSX(LTV)} LTV
      </span>
    </div>
  )
}
