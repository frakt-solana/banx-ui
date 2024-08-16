import { FC } from 'react'

import { createPercentValueJSX } from '@banx/components/TableComponents'

import { BorrowOffer } from '@banx/api/tokens'

import styles from './OrderBook.module.less'

export const AprCell: FC<{ offer: BorrowOffer }> = ({ offer }) => {
  const aprPercent = parseFloat(offer.apr) / 100

  return (
    <div className={styles.aprRow}>
      <span className={styles.aprValue}>{createPercentValueJSX(aprPercent)}</span>
    </div>
  )
}
