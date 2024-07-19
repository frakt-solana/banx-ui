import { FC } from 'react'

import { capitalize } from 'lodash'
import moment from 'moment'

import Timer from '@banx/components/Timer'

import { coreNew } from '@banx/api/nft'
import { SECONDS_IN_72_HOURS } from '@banx/pages/nftLending/LoansPage/constants'
import {
  LoanStatus,
  STATUS_LOANS_COLOR_MAP,
  STATUS_LOANS_MAP,
  calculateTimeFromNow,
} from '@banx/utils'

import styles from '../LoansActiveTable.module.less'

interface StatusCellProps {
  loan: coreNew.Loan
  isCardView: boolean
}

export const StatusCell: FC<StatusCellProps> = ({ loan, isCardView }) => {
  const { bondTradeTransaction } = loan

  const statusText = STATUS_LOANS_MAP[bondTradeTransaction.bondTradeTransactionState] || ''
  const statusColor = STATUS_LOANS_COLOR_MAP[statusText as LoanStatus] || ''

  const timeInfo = calculateTimeInfo(loan, statusText)

  const statusInfoTitle = (
    <span style={{ color: statusColor }} className={styles.columnCellTitle}>
      {capitalize(statusText)}
    </span>
  )
  const statusInfoSubtitle = <span className={styles.columnCellSubtitle}>{timeInfo}</span>

  return !isCardView ? (
    <div className={styles.columnCell}>
      {statusInfoTitle}
      {statusInfoSubtitle}
    </div>
  ) : (
    <span>
      {statusInfoTitle} ({statusInfoSubtitle})
    </span>
  )
}

const calculateTimeInfo = (loan: coreNew.Loan, status: string) => {
  const { fraktBond } = loan

  const currentTimeInSeconds = moment().unix()
  const timeSinceActivationInSeconds = currentTimeInSeconds - fraktBond.activatedAt.toNumber()

  if (status === LoanStatus.Active) {
    return calculateTimeFromNow(timeSinceActivationInSeconds)
  }

  if (status === LoanStatus.Terminating) {
    const expiredAt = fraktBond.refinanceAuctionStartedAt.toNumber() + SECONDS_IN_72_HOURS
    return <Timer expiredAt={expiredAt} />
  }

  return ''
}
