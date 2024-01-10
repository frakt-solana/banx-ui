import { FC } from 'react'

import { capitalize } from 'lodash'

import {
  NftImage,
  createPercentValueJSX,
  createSolValueJSX,
} from '@banx/components/TableComponents'

import { LenderActivity } from '@banx/api/activity'
import { NFT } from '@banx/api/core'
import { LoanStatus, STATUS_LOANS_COLOR_MAP, STATUS_LOANS_MAP } from '@banx/utils'

import styles from './ActivityTable.module.less'

interface StatusCellProps {
  loan: LenderActivity
}

export const StatusCell: FC<StatusCellProps> = ({ loan }) => {
  const loanStatus = STATUS_LOANS_MAP[loan.status]
  const statusColor = STATUS_LOANS_COLOR_MAP[loanStatus as LoanStatus]

  return (
    <span style={{ color: statusColor }} className={styles.statusCellTitle}>
      {capitalize(loanStatus)}
    </span>
  )
}

interface CollateralCellProps {
  nft: NFT
}

export const CollateralCell: FC<CollateralCellProps> = ({ nft }) => {
  const { name, imageUrl /* partnerPoints = 0, playerPoints = 0 */ } = nft.meta

  const [nftCollectionName, nftNumber] = name.split('#')
  const displayNftNumber = nftNumber ? `#${nftNumber}` : ''

  return (
    <div className={styles.collateralCell}>
      <div className={styles.collateralImageWrapper}>
        {/* {!!partnerPoints && (
          <PointsBanxBadge partnerPoints={partnerPoints} playerPoints={playerPoints} />
        )} */}
        <NftImage nftImage={imageUrl} />
      </div>

      <div className={styles.nftNames}>
        <p className={styles.nftCollectionName}>{nftCollectionName}</p>
        {displayNftNumber && <p className={styles.nftNumber}>{displayNftNumber}</p>}
      </div>
    </div>
  )
}

interface LentCellProps {
  loan: LenderActivity
}

export const LentCell: FC<LentCellProps> = ({ loan }) => {
  return <span className={styles.lentCellTitle}>{createSolValueJSX(loan.lent, 1e9)}</span>
}

interface AprCellProps {
  loan: LenderActivity
}

export const AprCell: FC<AprCellProps> = ({ loan }) => {
  const formattedApr = loan.apr / 100

  return <span className={styles.aprCellTitle}>{createPercentValueJSX(formattedApr)}</span>
}
