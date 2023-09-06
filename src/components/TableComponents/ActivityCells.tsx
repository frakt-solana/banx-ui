import { FC } from 'react'

import moment from 'moment'

import { SOLANAFM_URL } from '@banx/constants'

import styles from './TableCells.module.less'

interface DurationCellProps {
  publicKey: string
  timestamp: number
}

export const DurationCell: FC<DurationCellProps> = ({ timestamp, publicKey }) => {
  const timeSinceActivity = moment.unix(timestamp).fromNow()

  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={`${SOLANAFM_URL}/address/${publicKey}`}
      className={styles.activityTime}
    >
      {timeSinceActivity}
    </a>
  )
}
