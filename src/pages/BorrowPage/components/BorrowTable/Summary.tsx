import { FC, useState } from 'react'

import { sumBy } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { CounterSlider, Slider } from '@banx/components/Slider'
import { createSolValueJSX } from '@banx/components/TableComponents'

import {
  calcBorrowValueWithProtocolFee,
  calcBorrowValueWithRentFee,
  trackPageEvent,
} from '@banx/utils'

import { ONE_WEEK_IN_SECONDS } from './constants'
import { calcInterest } from './helpers'
import { TableNftData } from './types'

import styles from './BorrowTable.module.less'

interface SummaryProps {
  nftsInCart: TableNftData[]
  borrowAll: () => Promise<void>
  selectAmount: (value?: number) => void
  maxBorrowAmount: number
  maxBorrowPercent: number
  setMaxBorrowPercent: (value: number) => void
}

export const Summary: FC<SummaryProps> = ({
  maxBorrowAmount,
  nftsInCart,
  borrowAll,
  selectAmount,
  maxBorrowPercent,
  setMaxBorrowPercent,
}) => {
  const totalBorrow = sumBy(nftsInCart, ({ loanValue, nft }) => {
    const loanValueWithProtocolFee = calcBorrowValueWithProtocolFee(loanValue)
    return calcBorrowValueWithRentFee(loanValueWithProtocolFee, nft.loan.marketPubkey)
  })

  const totalWeeklyFee = sumBy(nftsInCart, ({ nft, loanValue }) =>
    calcInterest({
      timeInterval: ONE_WEEK_IN_SECONDS,
      loanValue,
      apr: nft.loan.marketApr,
    }),
  )

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
        <Slider
          value={maxBorrowPercent}
          onChange={setMaxBorrowPercent}
          min={25}
          max={100}
          marks={{
            25: '25%',
            50: '50%',
            75: '75%',
            100: '100%',
          }}
          label="Max Ltv"
          className={styles.borrowPercentSlider}
        />
        <CounterSlider
          className={styles.counterSlider}
          value={nftsInCart.length}
          onChange={selectAmount}
          max={maxBorrowAmount}
          label="# Nfts"
        />
        <Button onClick={onBorrow} disabled={!nftsInCart.length} loading={isBorrowing} size="large">
          Borrow {createSolValueJSX(totalBorrow, 1e9, '0◎')}
        </Button>
      </div>
    </div>
  )
}
