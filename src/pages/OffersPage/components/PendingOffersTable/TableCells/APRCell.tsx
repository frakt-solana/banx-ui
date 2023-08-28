import { FC } from 'react'

import { ColorByPercentHealth, getColorByPercent } from '@banx/utils'

import { TableUserOfferData } from '../helpers'

import styles from '../PendingOffersTable.module.less'

interface APRCellProps {
  offer: TableUserOfferData
}

export const APRCell: FC<APRCellProps> = ({ offer }) => {
  const colorAPR = getColorByPercent(offer.apr, ColorByPercentHealth)

  return (
    <span style={{ color: colorAPR }} className={styles.aprValue}>
      {offer.apr}%
    </span>
  )
}
