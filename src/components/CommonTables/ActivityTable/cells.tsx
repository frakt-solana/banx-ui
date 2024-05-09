import { FC } from 'react'

import { capitalize } from 'lodash'

import {
  DisplayValue,
  NftImage,
  PointsBanxBadge,
  createPercentValueJSX,
} from '@banx/components/TableComponents'

import { LenderActivity } from '@banx/api/activity'
import {
  LoanStatus,
  STATUS_LOANS_COLOR_MAP,
  STATUS_LOANS_MAP_WITH_REFINANCED_ACTIVE,
} from '@banx/utils'

import styles from './ActivityTable.module.less'

export const StatusCell: FC<{ loan: LenderActivity }> = ({ loan }) => {
  const loanStatus = STATUS_LOANS_MAP_WITH_REFINANCED_ACTIVE[loan.status]
  const statusColor = STATUS_LOANS_COLOR_MAP[loanStatus as LoanStatus]

  return (
    <span style={{ color: statusColor }} className={styles.statusCellTitle}>
      {capitalize(loanStatus)}
    </span>
  )
}

export const CollateralCell: FC<{ loan: LenderActivity }> = ({ loan }) => {
  const { name, imageUrl, partnerPoints = 0, playerPoints = 0 } = loan.nft.meta

  const [nftCollectionName, nftNumber] = name.split('#')
  const displayCollectionName = nftNumber ? `#${nftNumber}` : nftCollectionName

  return (
    <div className={styles.collateralCell}>
      <div className={styles.collateralImageWrapper}>
        {!!partnerPoints && (
          <PointsBanxBadge
            className={styles.badge}
            partnerPoints={partnerPoints}
            playerPoints={playerPoints}
          />
        )}
        <NftImage nftImage={imageUrl} />
      </div>
      <div className={styles.nftNames}>
        <p className={styles.nftCollectionName}>{displayCollectionName}</p>
      </div>
    </div>
  )
}

export const LentCell: FC<{ loan: LenderActivity }> = ({ loan }) => (
  <span className={styles.lentCellTitle}>
    <DisplayValue value={loan.lent} />
  </span>
)

export const AprCell: FC<{ loan: LenderActivity }> = ({ loan }) => {
  const aprInPercent = loan.apr / 100

  return <span className={styles.aprCellTitle}>{createPercentValueJSX(aprInPercent)}</span>
}
