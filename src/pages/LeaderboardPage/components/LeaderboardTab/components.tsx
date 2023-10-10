import { FC, useEffect, useState } from 'react'

import {
  HealthColorDecreasing,
  formatNumbersWithCommas,
  getColorByPercent,
  isImageUrl,
  shortenAddress,
} from '@banx/utils'

import styles from './LeaderboardTab.module.less'

const PLACEHOLDER_BANX_IMAGE = 'https://banxnft.s3.amazonaws.com/images/custom.png'

export const RANK_COLOR_MAP: Record<number, string> = {
  [1]: 'var(--additional-gold-primary)',
  [2]: 'var(--additional-silver-primary)',
  [3]: 'var(--additional-bronze-primary)',
}

interface UserInfoCellProps {
  rank: number
  user: string
  avatar: string
}

export const UserInfoCell: FC<UserInfoCellProps> = ({ rank, user, avatar }) => {
  const rankIndicatorColor = RANK_COLOR_MAP[rank]
  const [isImageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    const checkImage = async () => {
      const result = await isImageUrl(avatar)
      setImageLoaded(result)
    }
    checkImage()
  }, [avatar])

  return (
    <div className={styles.userInfoCell}>
      <div style={{ background: rankIndicatorColor }} className={styles.indicator} />
      <span className={styles.userRank}>{rank}</span>
      <img
        className={styles.userAvatar}
        src={isImageLoaded ? avatar : PLACEHOLDER_BANX_IMAGE}
        onError={() => setImageLoaded(false)}
      />
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
  const formattedPoints = formatNumbersWithCommas(points?.toFixed(0))

  return <span className={styles.pointsTitleCell}>{formattedPoints}</span>
}
