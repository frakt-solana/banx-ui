import { FC } from 'react'

import { CSVDownloadButton } from '@banx/components/Buttons'
import { StatInfo } from '@banx/components/StatInfo'

import { BorrowerActivity } from '@banx/api/activity'
import { generateCSVContent } from '@banx/utils'

import { ACTIVITY_CSV_FILENAME } from './constants'

import styles from './LoansHistoryTable.module.less'

interface SummaryProps {
  loans: BorrowerActivity[]
}

export const Summary: FC<SummaryProps> = ({ loans }) => {
  //TODO: Need take values from BE (waiting for endpoint from backend),
  const totalLoans = 25
  const totalBorrowed = 25
  const totalDebt = 25
  const totalRepaid = 105

  const csvContent = generateCSVContent(loans)

  return (
    <div className={styles.summary}>
      <div className={styles.totalOffers}>
        <p className={styles.totalOffersValue}>{totalLoans}</p>
        <div className={styles.totalOffersInfo}>
          <p className={styles.totalOffersInfoTitle}>Total loans</p>
          <p className={styles.totalOffersInfoSubtitle}>All time</p>
        </div>
      </div>
      <div className={styles.statsContainer}>
        <StatInfo label="Total borrowed" value={totalBorrowed} />
        <StatInfo label="Total debt" value={totalDebt} />
        <StatInfo label="Total repaid" value={totalRepaid} />
      </div>
      <CSVDownloadButton
        className={styles.summaryButton}
        data={csvContent}
        filename={ACTIVITY_CSV_FILENAME}
      />
    </div>
  )
}
