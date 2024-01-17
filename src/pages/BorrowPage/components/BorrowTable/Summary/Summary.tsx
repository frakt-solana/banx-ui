import { FC, useState } from 'react'

import classNames from 'classnames'
import { sumBy } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { CounterSlider, Slider } from '@banx/components/Slider'
import { createSolValueJSX } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'

import bonkTokenImg from '@banx/assets/BonkToken.png'
import {
  calcBorrowValueWithProtocolFee,
  calcBorrowValueWithRentFee,
  formatDecimal,
  getColorByPercent,
  trackPageEvent,
} from '@banx/utils'

import { ONE_WEEK_IN_SECONDS } from '../constants'
import { calcInterest } from '../helpers'
import { TableNftData } from '../types'

import styles from './Summary.module.less'

interface SummaryProps {
  nftsInCart: TableNftData[]
  borrowAll: () => Promise<void>
  selectAmount: (value?: number) => void
  maxBorrowAmount: number
  maxBorrowPercent: number
  setMaxBorrowPercent: (value: number) => void
  bonkRewardsAvailable: boolean
}

export const Summary: FC<SummaryProps> = ({
  maxBorrowAmount,
  nftsInCart,
  borrowAll,
  selectAmount,
  maxBorrowPercent,
  setMaxBorrowPercent,
  bonkRewardsAvailable,
}) => {
  const totalBorrow = sumBy(nftsInCart, ({ loanValue, nft }) => {
    const loanValueWithProtocolFee = calcBorrowValueWithProtocolFee(loanValue)
    return calcBorrowValueWithRentFee(loanValueWithProtocolFee, nft.loan.marketPubkey)
  })

  const totalUpfrontFee = sumBy(nftsInCart, ({ loanValue }) => {
    return loanValue - calcBorrowValueWithProtocolFee(loanValue)
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

  const showBonkRewardsSticker = !!(bonkRewardsAvailable && nftsInCart.length)

  return (
    <div className={styles.summary}>
      <div className={styles.collaterals}>
        <p className={styles.collateralsTitle}>{nftsInCart.length}</p>
        <p className={styles.collateralsSubtitle}>Nfts selected</p>
      </div>

      <div className={styles.statsContainer}>
        <div className={styles.stats}>
          <p className={styles.statsTitle}>Upfront fee</p>
          <p className={styles.statsValue}>
            {createSolValueJSX(totalUpfrontFee, 1e9, '0◎', formatDecimal)}
          </p>
        </div>
        <div className={styles.stats}>
          <p className={styles.statsTitle}>Weekly fee</p>
          <p className={styles.statsValue}>
            {createSolValueJSX(totalWeeklyFee, 1e9, '0◎', formatDecimal)}
          </p>
        </div>
        <div className={styles.stats}>
          <div className={styles.statsLabel}>
            <p className={classNames(styles.statsTitle, styles.statsTitleLeft)}>Loan value</p>
            <Tooltip title="Set the maximum amount to borrow against the # NFTs selected. Lower value loans have higher perpetuality" />
          </div>
          <MaxLtvSlider value={maxBorrowPercent} onChange={setMaxBorrowPercent} />
        </div>
      </div>

      <div className={styles.summaryControls}>
        <div className={styles.stats}>
          <p className={classNames(styles.statsTitle, styles.statsTitleLeft)}># NFTS</p>
          <CounterSlider
            className={styles.counterSlider}
            value={nftsInCart.length}
            onChange={selectAmount}
            max={maxBorrowAmount}
          />
        </div>
        <Button
          className={styles.borrowSummaryBtn}
          onClick={onBorrow}
          disabled={!nftsInCart.length}
          loading={isBorrowing}
          size="large"
        >
          {!!showBonkRewardsSticker && (
            <Tooltip className={styles.bonkTokenSticker} title="50% upfront fee refunded in $BONK">
              <img src={bonkTokenImg} alt="Bonk token sticker" />
            </Tooltip>
          )}
          Borrow {createSolValueJSX(totalBorrow, 1e9, '0◎')}
        </Button>
      </div>
    </div>
  )
}

interface MaxLtvSliderProps {
  value: number
  onChange: (value: number) => void
}

const MaxLtvSlider: FC<MaxLtvSliderProps> = ({ value, onChange }) => {
  const colorClassNameByValue = {
    30: styles.maxLtvSliderGreen,
    80: styles.maxLtvSliderYellow,
    100: styles.maxLtvSliderRed,
  }

  return (
    <Slider
      value={value}
      onChange={onChange}
      min={10}
      max={100}
      marks={{}}
      showValue="percent"
      className={styles.maxLtvSlider}
      rootClassName={getColorByPercent(value, colorClassNameByValue)}
    />
  )
}
