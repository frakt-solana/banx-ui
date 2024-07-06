import { useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import { StatInfo } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { activity } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'
import { createDownloadLink } from '@banx/utils'

import { useUserTokenLoansStats } from '../hooks'

import styles from './LoansTokenHistoryTable.module.less'

const ACTIVITY_CSV_FILENAME = 'banx_borrower_spl_activity.csv'

export const Summary = () => {
  const { publicKey } = useWallet()

  const { tokenType } = useNftTokenType()

  const { data } = useUserTokenLoansStats()
  const { totalLoans = 0, totalBorrowed = 0, totalRepaid = 0 } = data || {}

  const [isDownloading, setIsDownloading] = useState(false)
  const download = async () => {
    try {
      setIsDownloading(true)

      const data = await activity.fetchTokenBorrowerActivityCSV({
        walletPubkey: publicKey?.toBase58() || '',
        tokenType,
      })
      createDownloadLink(data, ACTIVITY_CSV_FILENAME)
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
        <StatInfo label="Borrowed" value={<DisplayValue value={totalBorrowed} />} />
        <StatInfo label="Repaid" value={<DisplayValue value={totalRepaid} />} />
      </div>
      <Button onClick={download} className={styles.summaryButton} loading={isDownloading}>
        Download .CSV
      </Button>
    </div>
  )
}
