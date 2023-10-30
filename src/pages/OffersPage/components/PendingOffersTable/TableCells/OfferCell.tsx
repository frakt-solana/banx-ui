import { FC } from 'react'

import { createPercentValueJSX, createSolValueJSX } from '@banx/components/TableComponents'

import { HealthColorIncreasing, formatDecimal, getColorByPercent } from '@banx/utils'

import { TableUserOfferData } from '../helpers'

import styles from '../PendingOffersTable.module.less'

interface OfferCellProps {
  offer: TableUserOfferData
  isCardView: boolean
}

export const OfferCell: FC<OfferCellProps> = ({ offer, isCardView }) => {
  const { loanValue, collectionFloor } = offer

  const ltv = (loanValue / collectionFloor) * 100

  const formattedLoanValue = createSolValueJSX(loanValue, 1e9, '--', formatDecimal)

  return !isCardView ? (
    <div className={styles.offerCell}>
      <span>{formattedLoanValue}</span>
      {createLtvValueJSX(ltv)}
    </div>
  ) : (
    <span>
      {formattedLoanValue} ({createLtvValueJSX(ltv)})
    </span>
  )
}

const createLtvValueJSX = (ltv: number) => {
  const colorLTV = getColorByPercent(ltv, HealthColorIncreasing)

  return (
    <span className={styles.offerCellSubtitle} style={{ color: colorLTV }}>
      {createPercentValueJSX(ltv)} LTV
    </span>
  )
}
