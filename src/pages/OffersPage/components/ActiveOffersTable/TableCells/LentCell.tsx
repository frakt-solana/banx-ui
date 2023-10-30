import { FC } from 'react'

import { createPercentValueJSX, createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { HealthColorIncreasing, formatDecimal, getColorByPercent } from '@banx/utils'

import styles from '../ActiveOffersTable.module.less'

interface LentCellProps {
  loan: Loan
  isCardView: boolean
}

export const LentCell: FC<LentCellProps> = ({ loan, isCardView }) => {
  const { solAmount, feeAmount } = loan.bondTradeTransaction || {}
  const { currentPerpetualBorrowed } = loan.fraktBond || {}

  const collectionFloor = loan.nft.collectionFloor

  const ltv = ((solAmount + feeAmount) / collectionFloor) * 100

  const formattedLentValue = createSolValueJSX(currentPerpetualBorrowed, 1e9, '0◎', formatDecimal)

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
  const colorLTV = getColorByPercent(ltv, HealthColorIncreasing)

  return (
    <span className={styles.lentInfoSubtitle} style={{ color: colorLTV }}>
      {createPercentValueJSX(ltv)} LTV
    </span>
  )
}
