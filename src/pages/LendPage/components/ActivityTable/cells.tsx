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

interface StatusCellProps {
  loan: LenderActivity
}

export const StatusCell: FC<StatusCellProps> = ({ loan }) => {
  const loanStatus = STATUS_LOANS_MAP_WITH_REFINANCED_ACTIVE[loan.status]
  const statusColor = STATUS_LOANS_COLOR_MAP[loanStatus as LoanStatus]

  return (
    <span style={{ color: statusColor }} className={styles.statusCellTitle}>
      {capitalize(loanStatus)}
    </span>
  )
}

interface CollateralCellProps {
  loan: LenderActivity
}

export const CollateralCell: FC<CollateralCellProps> = ({ loan }) => {
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

interface LentCellProps {
  loan: LenderActivity
}

export const LentCell: FC<LentCellProps> = ({ loan }) => {
  return (
    <span className={styles.lentCellTitle}>
      <DisplayValue value={loan.lent} />
    </span>
  )
}

interface AprCellProps {
  loan: LenderActivity
}

export const AprCell: FC<AprCellProps> = ({ loan }) => {
  const formattedApr = loan.apr / 100

  return <span className={styles.aprCellTitle}>{createPercentValueJSX(formattedApr)}</span>
}
