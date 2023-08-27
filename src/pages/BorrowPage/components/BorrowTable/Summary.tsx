import { sumBy } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { ONE_WEEK_IN_SECONDS } from './constants'
import { calcInterest } from './helpers'
import { useBorrowTable } from './hooks'

import styles from './BorrowTable.module.less'

export const Summary = () => {
  const { borrowAll, selectAll, nftsInCart } = useBorrowTable()

  const selectAllBtnText = !nftsInCart.length ? 'Select all' : 'Deselect all'

  const totalFloor = sumBy(nftsInCart, ({ nft }) => nft.nft.collectionFloor)
  const totalBorrow = sumBy(nftsInCart, ({ loanValue }) => loanValue)
  const totalWeeklyFee = sumBy(nftsInCart, ({ nft, loanValue }) =>
    calcInterest({
      timeInterval: ONE_WEEK_IN_SECONDS,
      loanValue,
      apr: nft.loan.marketApr,
    }),
  )

  return (
    <div className={styles.summary}>
      <div className={styles.collaterals}>
        <p className={styles.collateralsTitle}>{nftsInCart.length}</p>
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
        <Button variant="secondary" onClick={selectAll}>
          {selectAllBtnText}
        </Button>
        <Button onClick={borrowAll} disabled={!nftsInCart.length}>
          Borrow {createSolValueJSX(totalBorrow, 1e9, '0◎')}
        </Button>
      </div>
    </div>
  )
}
