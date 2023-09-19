import { FC } from 'react'

import { CSVDownloadButton } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { LenderActivity } from '@banx/api/activity'
import {
  HealthColorDecreasing,
  convertAprToApy,
  generateCSVContent,
  getColorByPercent,
} from '@banx/utils'

import { useUserOffersStats } from '../../hooks'
import { ACTIVITY_CSV_FILENAME } from './constants'

import styles from './HistoryOffersTable.module.less'

interface SummaryProps {
  loans: LenderActivity[]
}

export const Summary: FC<SummaryProps> = ({ loans }) => {
  const { data } = useUserOffersStats()

  const {
    totalOffers = 0,
    totalLent = 0,
    totalInterest = 0,
    totalReceived = 0,
    weightedApr = 0,
  } = data || {}

  const weightedApyPercent = convertAprToApy(weightedApr / 1e4)

  const colorAPR = getColorByPercent(weightedApyPercent, HealthColorDecreasing)
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
        <StatInfo label="Total Lent" value={totalLent} divider={1e9} />
        <StatInfo label="Total interest" value={totalInterest} divider={1e9} />
        <StatInfo
          label="Weighted APY"
          value={weightedApyPercent}
          valueType={VALUES_TYPES.PERCENT}
          valueStyles={{ color: colorAPR }}
          classNamesProps={{ value: styles.aprValue }}
        />

        <StatInfo label="Total received" value={totalReceived} divider={1e9} />
      </div>
      <CSVDownloadButton
        className={styles.summaryButton}
        data={csvContent}
        filename={ACTIVITY_CSV_FILENAME}
      />
    </div>
  )
}
