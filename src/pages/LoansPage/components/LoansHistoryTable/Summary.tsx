import { FC } from 'react'

import { CSVDownloadButton } from '@banx/components/Buttons'
import { StatInfo } from '@banx/components/StatInfo'

import { BorrowerActivity } from '@banx/api/activity'
import { generateCSVContent } from '@banx/utils'

import { useUserLoansStats } from '../../hooks'
import { ACTIVITY_CSV_FILENAME } from './constants'

import styles from './LoansHistoryTable.module.less'

interface SummaryProps {
  loans: BorrowerActivity[]
}

export const Summary: FC<SummaryProps> = ({ loans }) => {
  const { data } = useUserLoansStats()
  const { totalLoans = 0, totalBorrowed = 0, totalDebt = 0, totalRepaid = 0 } = data || {}

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
        <StatInfo label="Borrowed" value={totalBorrowed} divider={1e9} />
        <StatInfo label="Debt" value={totalDebt} divider={1e9} />
        <StatInfo label="Repaid" value={totalRepaid} divider={1e9} />
      </div>
      <CSVDownloadButton
        className={styles.summaryButton}
        data={csvContent}
        filename={ACTIVITY_CSV_FILENAME}
      />
    </div>
  )
}
