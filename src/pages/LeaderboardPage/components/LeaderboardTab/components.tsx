import { FC } from 'react'

import { HealthColorDecreasing, getColorByPercent, shortenAddress } from '@banx/utils'

import styles from './LeaderboardTab.module.less'

interface UserInfoCellProps {
  rank: number
  userAvatar: string
  userAddress: string
}

export const UserInfoCell: FC<UserInfoCellProps> = ({ rank, userAvatar, userAddress }) => {
  return (
    <div className={styles.userInfoCell}>
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
