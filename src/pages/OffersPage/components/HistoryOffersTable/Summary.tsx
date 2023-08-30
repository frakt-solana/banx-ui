import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'

import styles from './HistoryOffersTable.module.less'

export const Summary = () => {
  const totalFloor = 10
  const totalBorrow = 10
  const nftsInCart = 10

  return (
    <div className={styles.summary}>
      <div className={styles.collaterals}>
        <p className={styles.collateralsTitle}>{nftsInCart}</p>
        <p className={styles.collateralsSubtitle}>Collaterals selected</p>
      </div>
      <div className={styles.statsContainer}>
        <StatInfo label="Total Lent" value={totalFloor} />
        <StatInfo label="Total interest" value={totalBorrow} />
        <StatInfo label="Weighted APR" value={105} valueType={VALUES_TYPES.PERCENT} />
        <StatInfo label="Total received" value={105} />
      </div>
      <div className={styles.summaryBtns}>
        <Button>Download .CSV</Button>
      </div>
    </div>
  )
}
