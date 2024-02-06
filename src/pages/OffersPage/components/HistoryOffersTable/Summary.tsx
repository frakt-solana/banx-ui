import { useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import { StatInfo } from '@banx/components/StatInfo'
import { createPercentValueJSX } from '@banx/components/TableComponents'

import { fetchLenderActivity } from '@banx/api/activity'
import { convertAprToApy, createDownloadLink, generateCSVContent } from '@banx/utils'

import { useUserOffersStats } from '../../hooks'
import { ACTIVITY_CSV_FILENAME } from './constants'
import { formatLoanData } from './helpers'

import styles from './HistoryOffersTable.module.less'

export const Summary = () => {
  const { data } = useUserOffersStats()
  const { publicKey } = useWallet()

  const { totalLent = 0, totalInterest = 0, totalReceived = 0, weightedApr = 0 } = data || {}

  const weightedApyPercent = convertAprToApy(weightedApr / 1e4)

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
        <p>{createPercentValueJSX(weightedApyPercent)}</p>
        <p>Weighted APR</p>
      </div>
      <div className={styles.statsContainer}>
        <StatInfo label="Lent" value={totalLent} divider={1e9} />
        <StatInfo label="Pending interest" value={totalInterest} divider={1e9} />
        <StatInfo label="Earned interest" value={totalReceived} divider={1e9} />
      </div>
      <Button onClick={download} className={styles.summaryButton} loading={isDownloading}>
        Download .CSV
      </Button>
    </div>
  )
}
