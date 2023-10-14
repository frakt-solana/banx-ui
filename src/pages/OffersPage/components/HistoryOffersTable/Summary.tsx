import { useWallet } from '@solana/wallet-adapter-react'

import { CSVDownloadButton } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import { fetchLenderActivity } from '@banx/api/activity'
import {
  HealthColorDecreasing,
  convertAprToApy,
  createDownloadLink,
  generateCSVContent,
  getColorByPercent,
} from '@banx/utils'

import { useUserOffersStats } from '../../hooks'
import { ACTIVITY_CSV_FILENAME } from './constants'
import { formatLoanData } from './helpers'

import styles from './HistoryOffersTable.module.less'

export const Summary = () => {
  const { data } = useUserOffersStats()
  const { publicKey } = useWallet()

  const {
    totalOffers = 0,
    totalLent = 0,
    totalInterest = 0,
    totalReceived = 0,
    weightedApr = 0,
  } = data || {}

  const weightedApyPercent = convertAprToApy(weightedApr / 1e4)

  const colorAPR = getColorByPercent(weightedApyPercent, HealthColorDecreasing)

  const download = async () => {
    try {
      const data = await fetchLenderActivity({
        order: 'desc',
        sortBy: 'timestamp',
        walletPubkey: publicKey?.toBase58() || '',
        getAll: true,
      })

      const formattedLoans = data.map(formatLoanData)
      const csvContent = generateCSVContent(formattedLoans)

      createDownloadLink(csvContent, ACTIVITY_CSV_FILENAME)
      return data
    } catch (error) {
      console.error('Error downloading data:', error)
    }
  }

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
      <CSVDownloadButton onClick={download} className={styles.summaryButton} />
    </div>
  )
}
