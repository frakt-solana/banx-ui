import moment from 'moment'

import { useClusterStats } from '@banx/hooks'

import Timer from '../Timer'

import styles from './EpochProgressBar.module.less'

const MIN_DISPLAY_PROGRESS_PERCENT = 5

export const EpochProgressBar = () => {
  const { data: clusterStats } = useClusterStats()

  const { epochProgress = 0, epochApproxTimeRemaining = 0 } = clusterStats || {}

  const formattedEpochProgress = Math.max(epochProgress, MIN_DISPLAY_PROGRESS_PERCENT)
  const expiredAt = moment().unix() + epochApproxTimeRemaining

  return (
    <div className={styles.epochProgressBarContainer}>
      <div className={styles.epochProgressBarRemaining}>
        <span>Epoch ends in</span>
        <Timer expiredAt={expiredAt} />
      </div>
      <div className={styles.epochProgressBarWrapper}>
        <div className={styles.epochProgressBar} style={{ width: `${formattedEpochProgress}%` }} />
      </div>
    </div>
  )
}
