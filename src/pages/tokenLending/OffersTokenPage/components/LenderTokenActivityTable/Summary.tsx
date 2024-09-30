import { useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { activity } from '@banx/api/tokens'
import { useTokenType } from '@banx/store/common'
import { createDownloadLink, isBanxSolTokenType } from '@banx/utils'

import { useUserTokenOffersStats } from '../../hooks'

import styles from './LenderTokenActivityTable.module.less'

const ACTIVITY_CSV_FILENAME = 'banx_lender_spl_activity.csv'

export const Summary = () => {
  const { data } = useUserTokenOffersStats()
  const { publicKey } = useWallet()

  const { tokenType } = useTokenType()

  const {
    totalLent = 0,
    pendingInterest = 0,
    paidInterest = 0,
    weightedApr = 0,
    claimedLstYield = 0,
  } = data || {}

  const [isDownloading, setIsDownloading] = useState(false)
  const download = async () => {
    try {
      setIsDownloading(true)

      const data = await activity.fetchLenderTokenActivityCSV({
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
        {isBanxSolTokenType(tokenType) && (
          <StatInfo label="Claimed lst yield" value={<DisplayValue value={claimedLstYield} />} />
        )}
      </div>
      <Button onClick={download} className={styles.summaryButton} loading={isDownloading}>
        Download .CSV
      </Button>
    </div>
  )
}
