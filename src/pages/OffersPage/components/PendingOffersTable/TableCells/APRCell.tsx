import { FC } from 'react'

import { HealthColorDecreasing, getColorByPercent } from '@banx/utils'

import { TableUserOfferData } from '../helpers'

import styles from '../PendingOffersTable.module.less'

interface APRCellProps {
  offer: TableUserOfferData
}

export const APRCell: FC<APRCellProps> = ({ offer }) => {
  const colorAPR = getColorByPercent(offer.apr, HealthColorDecreasing)

  return (
    <span style={{ color: colorAPR }} className={styles.aprValue}>
      {offer.apr}%
    </span>
  )
}
