import moment from 'moment'

import { useClusterStats } from '@banx/hooks'
import { CountdownUnits, formatCountdownUnits } from '@banx/utils'

import Timer from '../Timer'

import styles from './EpochProgressBar.module.less'

const MIN_DISPLAY_PROGRESS_PERCENT = 5

export const EpochProgressBar = () => {
  const { data: clusterStats } = useClusterStats()

  const { epochProgress = 0, epochApproxTimeRemaining = 0 } = clusterStats || {}

  const formattedEpochProgress = Math.max(epochProgress * 100, MIN_DISPLAY_PROGRESS_PERCENT)
  const expiredAt = moment().unix() + epochApproxTimeRemaining

  return (
    <div className={styles.epochProgressBarContainer}>
      <div className={styles.epochProgressBarRemaining}>
        <span>Epoch ends in</span>
        <Timer expiredAt={expiredAt} formatCountdownUnits={customEpochFormatCountdownUnits} />
      </div>
      <div className={styles.epochProgressBarWrapper}>
        <div className={styles.epochProgressBar} style={{ width: `${formattedEpochProgress}%` }} />
      </div>
    </div>
  )
}

export const customEpochFormatCountdownUnits = (countdownUnits: CountdownUnits): string => {
  const { days, hours, minutes } = countdownUnits

  if (!days && !hours && !minutes) {
    return '<1m'
  }
  if (!days && !hours) {
    return formatCountdownUnits(countdownUnits, 'm')
  }

  if (!days) {
    return formatCountdownUnits(countdownUnits, 'h:m')
  }

  return formatCountdownUnits(countdownUnits, 'd:h')
}
