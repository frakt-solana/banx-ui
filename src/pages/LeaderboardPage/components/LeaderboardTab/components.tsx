import { FC } from 'react'

import {
  HealthColorDecreasing,
  formatNumbersWithCommas,
  getColorByPercent,
  shortenAddress,
} from '@banx/utils'

import styles from './LeaderboardTab.module.less'

interface UserInfoCellProps {
  rank: number
  userAvatar: string
  userAddress: string
}

export const RANK_COLOR_MAP: Record<number, string> = {
  [1]: 'var(--additional-gold-primary)',
  [2]: 'var(--additional-silver-primary)',
  [3]: 'var(--additional-bronze-primary)',
}

export const UserInfoCell: FC<UserInfoCellProps> = ({ rank, userAvatar, userAddress }) => {
  const rankIndicatorColor = RANK_COLOR_MAP[rank]

  return (
    <div className={styles.userInfoCell}>
      <div style={{ background: rankIndicatorColor }} className={styles.indicator} />
      <span className={styles.userRank}>{rank}</span>
      <img className={styles.userAvatar} src={userAvatar} />
      <span className={styles.userWalletAddress}>{shortenAddress(userAddress)}</span>
    </div>
  )
}

export const LoyaltyCell: FC<{ loyalty: number }> = ({ loyalty }) => {
  const loyaltyColor = getColorByPercent(loyalty, HealthColorDecreasing)

  return (
    <span style={{ color: loyaltyColor }} className={styles.loyaltyTitleCell}>
      {loyalty}%
    </span>
  )
}

export const PointsCell: FC<{ points: number }> = ({ points }) => {
  const formattedPoints = formatNumbersWithCommas(points)

  return <span className={styles.pointsTitleCell}>{formattedPoints}</span>
}
