import { FC } from 'react'

import { CSVDownloadButton } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { LenderActivity } from '@banx/api/activity'
import { ColorByPercentHealth, generateCSVContent, getColorByPercent } from '@banx/utils'

import { ACTIVITY_CSV_FILENAME } from './constants'

import styles from './HistoryOffersTable.module.less'

interface SummaryProps {
  loans: LenderActivity[]
}

export const Summary: FC<SummaryProps> = ({ loans }) => {
  //TODO: Need take values from BE
  const totalOffers = 25
  const totalLent = 25
  const totalInterest = 25
  const totalReceived = 105
  const weightedAPR = 104

  const colorAPR = getColorByPercent(weightedAPR, ColorByPercentHealth)
  const csvContent = generateCSVContent(loans)

  return (
    <div className={styles.summary}>
      <div className={styles.totalOffers}>
        <p className={styles.totalOffersValue}>{totalOffers}</p>
        <div className={styles.totalOffersInfo}>
          <p className={styles.totalOffersInfoTitle}>Total offers</p>
          <p className={styles.totalOffersInfoSubtitle}>All time</p>
        </div>
      </div>
      <div className={styles.statsContainer}>
        <StatInfo label="Total Lent" value={totalLent} />
        <StatInfo label="Total interest" value={totalInterest} />
        <StatInfo
          label="Weighted APR"
          value={weightedAPR}
          valueType={VALUES_TYPES.PERCENT}
          valueStyles={{ color: colorAPR }}
          classNamesProps={{ value: styles.aprValue }}
        />
        <StatInfo label="Total received" value={totalReceived} />
      </div>
      <CSVDownloadButton
        className={styles.summaryButton}
        data={csvContent}
        filename={ACTIVITY_CSV_FILENAME}
      />
    </div>
  )
}
