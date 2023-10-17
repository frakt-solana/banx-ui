import { FC } from 'react'

import { createPercentValueJSX, createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { HealthColorDecreasing, getColorByPercent } from '@banx/utils'

import styles from '../ActiveOffersTable.module.less'

interface LentCellProps {
  loan: Loan
  isCardView: boolean
}

export const LentCell: FC<LentCellProps> = ({ loan, isCardView }) => {
  const { solAmount, feeAmount } = loan.bondTradeTransaction || {}

  const collectionFloor = loan.nft.collectionFloor

  const lentValue = solAmount + feeAmount
  const ltv = (lentValue / collectionFloor) * 100

  const formattedLentValue = createSolValueJSX(lentValue, 1e9, '0◎')

  return !isCardView ? (
    <div className={styles.lentInfo}>
      <span>{formattedLentValue}</span>
      {createLtvValueJSX(ltv)}
    </div>
  ) : (
    <span>
      {formattedLentValue} ({createLtvValueJSX(ltv)})
    </span>
  )
}

const createLtvValueJSX = (ltv: number) => {
  const colorLTV = getColorByPercent(ltv, HealthColorDecreasing)

  return (
    <span className={styles.lentInfoSubtitle} style={{ color: colorLTV }}>
      {createPercentValueJSX(ltv)} LTV
    </span>
  )
}
