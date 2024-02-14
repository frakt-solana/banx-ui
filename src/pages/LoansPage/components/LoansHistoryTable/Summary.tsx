import { useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import { StatInfo } from '@banx/components/StatInfo'

import { fetchBorrowerActivity } from '@banx/api/activity'
import { createDownloadLink, generateCSVContent } from '@banx/utils'

import { useUserLoansStats } from '../../hooks'
import { ACTIVITY_CSV_FILENAME } from './constants'
import { formatLoanData } from './helpers'

import styles from './LoansHistoryTable.module.less'

export const Summary = () => {
  const { publicKey } = useWallet()

  const { data } = useUserLoansStats()
  const { totalLoans = 0, totalBorrowed = 0, totalRepaid = 0 } = data || {}

  const [isDownloading, setIsDownloading] = useState(false)
  const download = async () => {
    try {
      setIsDownloading(true)
      const data = await fetchBorrowerActivity({
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
        <p>{totalLoans}</p>
        <p>Total loans</p>
      </div>
      <div className={styles.statsContainer}>
        <StatInfo label="Borrowed" value={totalBorrowed} divider={1e9} />
        <StatInfo label="Repaid" value={totalRepaid} divider={1e9} />
      </div>
      <Button onClick={download} className={styles.summaryButton} loading={isDownloading}>
        Download .CSV
      </Button>
    </div>
  )
}
