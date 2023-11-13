import { FC, useState } from 'react'

import { sumBy } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { CounterSlider } from '@banx/components/Slider'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { calcLoanValueWithProtocolFee, trackPageEvent } from '@banx/utils'

import { ONE_WEEK_IN_SECONDS } from './constants'
import { calcInterest } from './helpers'
import { TableNftData } from './types'

import styles from './BorrowTable.module.less'

interface SummaryProps {
  nftsInCart: TableNftData[]
  borrowAll: () => Promise<void>
  selectAmount: (value?: number) => void
  maxBorrowAmount: number
}

export const Summary: FC<SummaryProps> = ({
  maxBorrowAmount,
  nftsInCart,
  borrowAll,
  selectAmount,
}) => {
  const totalBorrow = calcLoanValueWithProtocolFee(sumBy(nftsInCart, ({ loanValue }) => loanValue))
  const totalWeeklyFee = sumBy(nftsInCart, ({ nft, loanValue }) =>
    calcInterest({
      timeInterval: ONE_WEEK_IN_SECONDS,
      loanValue,
      apr: nft.loan.marketApr,
    }),
  )

  // const [value, setValue] = useState(nftsInCart.length)

  // const debouncedChangeHandler = useCallback(debounce(selectAmount, 300), [])

  // useEffect(() => {
  //   debouncedChangeHandler(value)
  // }, [value, debouncedChangeHandler])

  const [isBorrowing, setIsBorrowing] = useState(false)
  const onBorrow = async () => {
    setIsBorrowing(true)
    trackPageEvent('borrow', `borrow-bottom`)
    await borrowAll()
    setIsBorrowing(false)
  }

  return (
    <div className={styles.summary}>
      <div className={styles.collaterals}>
        <p className={styles.collateralsTitle}>{nftsInCart.length}</p>
        <p className={styles.collateralsSubtitle}>Nfts selected</p>
      </div>
      <div className={styles.statsContainer}>
        <div className={styles.stats}>
          <p>To borrow</p>
          <p>{createSolValueJSX(totalBorrow, 1e9, '0◎')}</p>
        </div>
        <div className={styles.stats}>
          <p>Weekly fee</p>
          <p>{createSolValueJSX(totalWeeklyFee, 1e9, '0◎')}</p>
        </div>
      </div>
      <div className={styles.summaryBtns}>
        <CounterSlider value={nftsInCart.length} onChange={selectAmount} max={maxBorrowAmount} />
        <Button onClick={onBorrow} disabled={!nftsInCart.length} loading={isBorrowing} size="large">
          Borrow {createSolValueJSX(totalBorrow, 1e9, '0◎')}
        </Button>
      </div>
    </div>
  )
}
