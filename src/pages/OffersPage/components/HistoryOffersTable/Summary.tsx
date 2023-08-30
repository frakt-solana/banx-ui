import { Button } from '@banx/components/Buttons'
import { createSolValueJSX } from '@banx/components/TableComponents'

import styles from './HistoryOffersTable.module.less'

export const Summary = () => {
  const totalFloor = 10
  const totalBorrow = 10
  const totalWeeklyFee = 10
  const nftsInCart = 10

  return (
    <div className={styles.summary}>
      <div className={styles.collaterals}>
        <p className={styles.collateralsTitle}>{nftsInCart}</p>
        <p className={styles.collateralsSubtitle}>Collaterals selected</p>
      </div>
      <div className={styles.statsContainer}>
        <div className={styles.stats}>
          <p>Total floor</p>
          <p>{createSolValueJSX(totalFloor, 1e9, '0◎')}</p>
        </div>
        <div className={styles.stats}>
          <p>Total borrow</p>
          <p>{createSolValueJSX(totalBorrow, 1e9, '0◎')}</p>
        </div>
        <div className={styles.stats}>
          <p>Total weekly fee</p>
          <p>{createSolValueJSX(totalWeeklyFee, 1e9, '0◎')}</p>
        </div>
      </div>
      <div className={styles.summaryBtns}>
        <Button>Download .CSV</Button>
      </div>
    </div>
  )
}
