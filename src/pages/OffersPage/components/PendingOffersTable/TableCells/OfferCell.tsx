import { FC } from 'react'

import { createPercentValueJSX, createSolValueJSX } from '@banx/components/TableComponents'

import { HealthColorDecreasing, getColorByPercent } from '@banx/utils'

import { TableUserOfferData } from '../helpers'

import styles from '../PendingOffersTable.module.less'

interface OfferCellProps {
  offer: TableUserOfferData
}

export const OfferCell: FC<OfferCellProps> = ({ offer }) => {
  const { loanValue, collectionFloor } = offer

  const ltv = (loanValue / collectionFloor) * 100

  const colorLTV = getColorByPercent(ltv, HealthColorDecreasing)

  return (
    <div className={styles.offerCell}>
      <span>{createSolValueJSX(loanValue, 1e9)}</span>
      <span style={{ color: colorLTV }}>{createPercentValueJSX(ltv)} LTV</span>
    </div>
  )
}
