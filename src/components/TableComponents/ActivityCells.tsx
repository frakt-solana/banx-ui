import { FC } from 'react'

import classNames from 'classnames'
import moment from 'moment'

import { SOLANAFM_URL } from '@banx/constants'

import styles from './TableCells.module.less'

interface DurationCellProps {
  publicKey: string
  timestamp: number
  className?: string
}

export const DurationCell: FC<DurationCellProps> = ({ timestamp, publicKey, className }) => {
  const timeSinceActivity = moment.unix(timestamp).fromNow()

  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={`${SOLANAFM_URL}/address/${publicKey}`}
      className={classNames(styles.activityTime, className)}
    >
      {timeSinceActivity}
    </a>
  )
}
