import { useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { createPercentValueJSX } from '@banx/components/TableComponents'

import { fetchLenderActivity } from '@banx/api/activity'
import { createDownloadLink, generateCSVContent } from '@banx/utils'

import { useUserOffersStats } from '../../hooks'
import { ACTIVITY_CSV_FILENAME } from './constants'
import { formatLoanData } from './helpers'

import styles from './HistoryOffersTable.module.less'

export const Summary = () => {
  const { data } = useUserOffersStats()
  const { publicKey } = useWallet()

  const { totalLent = 0, pendingInterest = 0, paidInterest = 0, weightedApr = 0 } = data || {}

  const [isDownloading, setIsDownloading] = useState(false)
  const download = async () => {
    try {
      setIsDownloading(true)
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
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className={styles.summary}>
      <div className={styles.mainStat}>
        <p>{createPercentValueJSX(weightedApr / 100)}</p>
        <p>Weighted apr</p>
      </div>
      <div className={styles.statsContainer}>
        <StatInfo label="Lent" value={totalLent} divider={1e9} />
        <StatInfo
          classNamesProps={{ container: styles.weightedAprStat }}
          label="Weighted apr"
          value={weightedApr / 100}
          valueType={VALUES_TYPES.PERCENT}
        />
        <StatInfo label="Pending interest" value={pendingInterest} divider={1e9} />
        <StatInfo label="Earned interest" value={paidInterest} divider={1e9} />
      </div>
      <Button onClick={download} className={styles.summaryButton} loading={isDownloading}>
        Download .CSV
      </Button>
    </div>
  )
}
