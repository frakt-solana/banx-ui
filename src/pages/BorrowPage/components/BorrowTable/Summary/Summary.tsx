import { FC, useMemo, useState } from 'react'

import classNames from 'classnames'
import { map, sumBy } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { CounterSlider, Slider, SliderProps } from '@banx/components/Slider'
import { createPercentValueJSX, createSolValueJSX } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'

import { BorrowNft } from '@banx/api/core'
import bonkTokenImg from '@banx/assets/BonkToken.png'
import { BONDS } from '@banx/constants'
import {
  calcBorrowValueWithProtocolFee,
  calcBorrowValueWithRentFee,
  calcWeightedAverage,
  calculateApr,
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

const calLoanValueWithFees = (nft: TableNftData) => {
  const loanValueWithProtocolFee = calcBorrowValueWithProtocolFee(nft.loanValue)
  return calcBorrowValueWithRentFee(loanValueWithProtocolFee, nft.nft.loan.marketPubkey)
}

const caclAprValue = (nft: BorrowNft, loanValue: number) => {
  return calculateApr({
    loanValue,
    collectionFloor: nft.nft.collectionFloor,
    marketPubkey: nft.loan.marketPubkey,
  })
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
  const totalBorrow = sumBy(nftsInCart, calLoanValueWithFees)

  const totalUpfrontFee = sumBy(nftsInCart, ({ loanValue }) => {
    return loanValue - calcBorrowValueWithProtocolFee(loanValue)
  })

  const totalWeeklyFee = sumBy(nftsInCart, ({ nft, loanValue }) => {
    const apr = caclAprValue(nft, loanValue)
    return calcInterest({ timeInterval: ONE_WEEK_IN_SECONDS, loanValue, apr })
  })

  const weightedApr = useMemo(() => {
    const totalApr = map(
      nftsInCart,
      ({ nft, loanValue }) => (caclAprValue(nft, loanValue) + BONDS.PROTOCOL_REPAY_FEE) / 100,
    )
    const totalLoanValue = map(nftsInCart, calLoanValueWithFees)

    return calcWeightedAverage(totalApr, totalLoanValue)
  }, [nftsInCart])

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
      <div className={styles.mainStat}>
        <p>{createPercentValueJSX(weightedApr, '0%')}</p>
        <p>Weighted apr</p>
      </div>

      <div className={styles.statsContainer}>
        <div className={styles.stats}>
          <p className={styles.statsTitle}>Upfront fee</p>
          <p className={styles.statsValue}>
            {createSolValueJSX(totalUpfrontFee, 1e9, '0◎', formatDecimal)}
          </p>
        </div>
        <div className={classNames(styles.stats, styles.hidden)}>
          <p className={styles.statsTitle}>Weighted apr</p>
          <p className={styles.statsValue}>{createPercentValueJSX(weightedApr, '0%')}</p>
        </div>
        <div className={styles.stats}>
          <p className={styles.statsTitle}>Weekly fee</p>
          <p className={styles.statsValue}>
            {createSolValueJSX(totalWeeklyFee, 1e9, '0◎', formatDecimal)}
          </p>
        </div>
      </div>

      <div className={styles.summaryControls}>
        <div className={styles.slidersWrapper}>
          <MaxLtvSlider
            label="Loan value"
            value={maxBorrowPercent}
            onChange={setMaxBorrowPercent}
            tooltipText="Set the maximum amount to borrow against the # NFTs selected. Lower value loans have higher perpetuality"
          />

          <CounterSlider
            label="# NFTs"
            rootClassName={styles.nftsSlider}
            className={styles.nftsSliderContainer}
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

interface MaxLtvSliderProps extends SliderProps {
  value: number
  onChange: (value: number) => void
}

const MaxLtvSlider: FC<MaxLtvSliderProps> = ({ value, onChange, ...props }) => {
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
      {...props}
    />
  )
}
