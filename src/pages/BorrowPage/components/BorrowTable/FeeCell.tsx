import { FC } from 'react'

import { createPercentValueJSX, createSolValueJSX } from '@banx/components/TableComponents'

import { TableNftData } from './types'

import styles from './BorrowTable.module.less'

export const FeeCell: FC<{ nft: TableNftData }> = ({ nft }) => {
  return (
    <div className={styles.feeCell}>
      <p className={styles.feeCellTitle}>{createSolValueJSX(nft.interest, 1e9)}</p>
      <p className={styles.feeCellSubtitle}>
        {createPercentValueJSX(nft.nft.loan.marketApr / 100)} APR
      </p>
    </div>
  )
}
