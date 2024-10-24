import { FC, useMemo, useState } from 'react'

import classNames from 'classnames'
import { BN } from 'fbonds-core'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { map, sumBy } from 'lodash'

import { Button } from '@banx/components/Buttons'
import { CounterSlider, Slider, SliderProps } from '@banx/components/Slider'
import { DisplayValue, createPercentValueJSX } from '@banx/components/TableComponents'

import { core } from '@banx/api/nft'
import { BONDS, ONE_WEEK_IN_SECONDS } from '@banx/constants'
import { useTokenType } from '@banx/store/common'
import {
  NftWithLoanValue,
  adjustBorrowValueWithSolanaRentFee,
  calcWeightedAverage,
  calculateApr,
  calculateBorrowValueWithProtocolFee,
  calculateInterestOnBorrow,
  getColorByPercent,
} from '@banx/utils'

import { useBorrowNftTransactions } from '../../hooks'

import styles from './Summary.module.less'

//? Prop drilling is needed. Otherwise loanValuePercent won't work
type SummaryProps = {
  nftsInCart: NftWithLoanValue[]
  loanValuePercent: number
  maxNftsToBorrow: number
  onSelectNftsAmount: (amount: number) => void
  setLoanValuePercent: (value: number) => void
  marketPubkey: string
}

export const Summary: FC<SummaryProps> = ({
  nftsInCart,
  loanValuePercent,
  maxNftsToBorrow,
  onSelectNftsAmount,
  setLoanValuePercent,
  marketPubkey,
}) => {
  const { borrowBulk } = useBorrowNftTransactions(marketPubkey)

  const { tokenType } = useTokenType()

  const totalBorrow = sumBy(nftsInCart, (nft) => calcLoanValueWithFees(nft, tokenType))

  const totalUpfrontFee = sumBy(nftsInCart, ({ loanValue }) => {
    return loanValue - calculateBorrowValueWithProtocolFee(loanValue)
  })

  const totalWeeklyFee = sumBy(nftsInCart, ({ nft, loanValue }) => {
    const apr = caclAprValue(nft, loanValue)
    return calculateInterestOnBorrow({ timeInterval: ONE_WEEK_IN_SECONDS, loanValue, apr })
  })

  const weightedApr = useMemo(() => {
    const totalApr = map(
      nftsInCart,
      ({ nft, loanValue }) => (caclAprValue(nft, loanValue) + BONDS.REPAY_FEE_APR) / 100,
    )
    const totalLoanValue = map(nftsInCart, (nft) => calcLoanValueWithFees(nft, tokenType))

    return calcWeightedAverage(totalApr, totalLoanValue)
  }, [nftsInCart, tokenType])

  const [isBorrowing, setIsBorrowing] = useState(false)
  const onBorrow = async () => {
    setIsBorrowing(true)
    await borrowBulk(nftsInCart)
    setIsBorrowing(false)
  }

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
            <DisplayValue value={totalUpfrontFee} />
          </p>
        </div>
        <div className={classNames(styles.stats, styles.hidden)}>
          <p className={styles.statsTitle}>Weighted apr</p>
          <p className={styles.statsValue}>{createPercentValueJSX(weightedApr, '0%')}</p>
        </div>
        <div className={styles.stats}>
          <p className={styles.statsTitle}>Weekly fee</p>
          <p className={styles.statsValue}>
            <DisplayValue value={totalWeeklyFee} />
          </p>
        </div>
      </div>

      <div className={styles.summaryControls}>
        <div className={styles.slidersWrapper}>
          <MaxLtvSlider
            label="Loan value"
            value={loanValuePercent}
            onChange={setLoanValuePercent}
            tooltipText="Set the maximum amount to borrow against the # NFTs selected. Lower value loans have higher perpetuality"
          />

          <CounterSlider
            label="# NFTs"
            rootClassName={styles.nftsSlider}
            className={styles.nftsSliderContainer}
            value={nftsInCart.length}
            onChange={onSelectNftsAmount}
            max={maxNftsToBorrow}
          />
        </div>
        <Button
          className={styles.borrowSummaryBtn}
          onClick={onBorrow}
          disabled={!nftsInCart.length}
          loading={isBorrowing}
        >
          Borrow <DisplayValue value={totalBorrow} />
        </Button>
      </div>
    </div>
  )
}

type MaxLtvSliderProps = {
  value: number
  onChange: (value: number) => void
} & SliderProps

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

const calcLoanValueWithFees = (nft: NftWithLoanValue, tokenType: LendingTokenType) => {
  const loanValueWithProtocolFee = calculateBorrowValueWithProtocolFee(nft.loanValue)

  return adjustBorrowValueWithSolanaRentFee({
    value: new BN(loanValueWithProtocolFee),
    marketPubkey: nft.nft.loan.marketPubkey,
    tokenType,
  }).toNumber()
}

const caclAprValue = (nft: core.BorrowNft, loanValue: number) => {
  return calculateApr({
    loanValue,
    collectionFloor: nft.nft.collectionFloor,
    marketPubkey: nft.loan.marketPubkey,
  })
}