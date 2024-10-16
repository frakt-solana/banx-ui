import { FC } from 'react'

import { user } from '@banx/api/common'
import placeholderBanxImg from '@banx/assets/PlaceholderBanx.png'
import { useImagePreload } from '@banx/hooks'
import { formatNumbersWithCommas, shortenAddress } from '@banx/utils'

import styles from './LeaderboardTab.module.less'

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
  const imageLoaded = useImagePreload(avatar)

  return (
    <div className={styles.userInfoCell}>
      <div style={{ background: rankIndicatorColor }} className={styles.indicator} />
      <span className={styles.userRank}>{rank}</span>
      <img className={styles.userAvatar} src={imageLoaded ? avatar : placeholderBanxImg} />
      <span className={styles.userWalletAddress}>{shortenAddress(user)}</span>
    </div>
  )
}

export const PointsCell: FC<{ points: number }> = ({ points = 0 }) => {
  const formattedPoints = formatNumbersWithCommas(points?.toFixed(0))

  return <span className={styles.pointsTitleCell}>{formattedPoints}</span>
}

interface TimeRangeSwitcherProps {
  selectedMode: user.LeaderboardTimeRange
  onModeChange: (newMode: user.LeaderboardTimeRange) => void
}

interface ModeOption {
  label: string
  value: user.LeaderboardTimeRange
}

export const TimeRangeSwitcher: FC<TimeRangeSwitcherProps> = ({ selectedMode, onModeChange }) => {
  const modeOptions: ModeOption[] = [
    { label: 'Week', value: 'week' },
    { label: 'All', value: 'all' },
  ]

  return (
    <div className={styles.switcher}>
      <div className={styles.modesWrapper}>
        {modeOptions.map(({ label, value }) => (
          <span
            key={value}
            className={selectedMode === value ? styles.active : ''}
            onClick={() => onModeChange(value)}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
