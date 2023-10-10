import { FC } from 'react'

import { LeaderboardData } from '@banx/api/user'
import {
  HealthColorDecreasing,
  formatNumbersWithCommas,
  getColorByPercent,
  shortenAddress,
} from '@banx/utils'

import styles from './LeaderboardTab.module.less'

export const RANK_COLOR_MAP: Record<number, string> = {
  [1]: 'var(--additional-gold-primary)',
  [2]: 'var(--additional-silver-primary)',
  [3]: 'var(--additional-bronze-primary)',
}

export const UserInfoCell: FC<LeaderboardData> = ({ rank, user, avatar }) => {
  const rankIndicatorColor = RANK_COLOR_MAP[rank]

  return (
    <div className={styles.userInfoCell}>
      <div style={{ background: rankIndicatorColor }} className={styles.indicator} />
      <span className={styles.userRank}>{rank}</span>
      <img className={styles.userAvatar} src={avatar} />
      <span className={styles.userWalletAddress}>{shortenAddress(user)}</span>
    </div>
  )
}

export const LoyaltyCell: FC<{ loyalty: number }> = ({ loyalty }) => {
  const formattedLoyalty = Math.max((loyalty - 1) * 100, 0)
  const loyaltyColor = getColorByPercent(loyalty, HealthColorDecreasing)

  return (
    <span style={{ color: loyaltyColor }} className={styles.loyaltyTitleCell}>
      {formattedLoyalty}%
    </span>
  )
}

export const PointsCell: FC<{ points: number }> = ({ points = 0 }) => {
  const formattedPoints = formatNumbersWithCommas(points?.toFixed(2))

  return <span className={styles.pointsTitleCell}>{formattedPoints}</span>
}
