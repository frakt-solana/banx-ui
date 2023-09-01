import { FC } from 'react'

import moment from 'moment'

import { LenderActivity } from '@banx/api/core'
import { SOLANAFM_URL } from '@banx/constants'

import styles from '../HistoryOffersTable.module.less'

interface DurationCellProps {
  loan: LenderActivity
}

export const DurationCell: FC<DurationCellProps> = ({ loan }) => {
  const { timestamp, publicKey } = loan
  const timeSinceActivity = moment.unix(timestamp).fromNow()

  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={`${SOLANAFM_URL}/address/${publicKey}`}
      className={styles.time}
    >
      {timeSinceActivity}
    </a>
  )
}
