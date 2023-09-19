import { FC } from 'react'

import { HealthColorDecreasing, convertAprToApy, getColorByPercent } from '@banx/utils'

import { TableUserOfferData } from '../helpers'

import styles from '../PendingOffersTable.module.less'

interface APRCellProps {
  offer: TableUserOfferData
}

export const APRCell: FC<APRCellProps> = ({ offer }) => {
  const colorAPR = getColorByPercent(offer.apr, HealthColorDecreasing)

  return (
    <span style={{ color: colorAPR }} className={styles.aprValue}>
      {convertAprToApy(offer.apr / 100)}%
    </span>
  )
}
