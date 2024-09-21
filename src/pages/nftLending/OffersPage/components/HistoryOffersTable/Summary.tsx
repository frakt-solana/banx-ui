import { useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { activity } from '@banx/api/nft'
import { useNftTokenType } from '@banx/store/nft'
import { createDownloadLink } from '@banx/utils'

import { useUserOffersStats } from '../../hooks'
import { ACTIVITY_CSV_FILENAME } from './constants'

import styles from './HistoryOffersTable.module.less'

export const Summary = () => {
  const { data } = useUserOffersStats()
  const { publicKey } = useWallet()

  const { tokenType } = useNftTokenType()

  const { totalLent = 0, pendingInterest = 0, paidInterest = 0, weightedApr = 0 } = data || {}

  const [isDownloading, setIsDownloading] = useState(false)
  const download = async () => {
    try {
      setIsDownloading(true)

      const data = await activity.fetchLenderActivityCSV({
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
        <p>{createPercentValueJSX(weightedApr / 100, '0%')}</p>
        <p>Weighted apr</p>
      </div>
      <div className={styles.statsContainer}>
        <StatInfo label="Lent" value={<DisplayValue value={totalLent} />} />
        <StatInfo
          classNamesProps={{ container: styles.weightedAprStat }}
          label="Weighted apr"
          value={weightedApr / 100}
          valueType={VALUES_TYPES.PERCENT}
        />
        <StatInfo label="Pending interest" value={<DisplayValue value={pendingInterest} />} />
        <StatInfo label="Earned interest" value={<DisplayValue value={paidInterest} />} />
      </div>
      <Button onClick={download} className={styles.summaryButton} loading={isDownloading}>
        Download .CSV
      </Button>
    </div>
  )
}
