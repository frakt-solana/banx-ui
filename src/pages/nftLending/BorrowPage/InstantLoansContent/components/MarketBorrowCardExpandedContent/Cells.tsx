import { FC } from 'react'

import classNames from 'classnames'
import { BN } from 'fbonds-core'
import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import {
  DisplayValue,
  HorizontalCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'

import { BONDS, SECONDS_IN_DAY } from '@banx/constants'
import {
  adjustBorrowValueWithSolanaRentFee,
  calculateApr,
  calculateBorrowValueWithProtocolFee,
} from '@banx/utils'

import { TableNftData } from './hooks'

import styles from './MarketBorrowCardExpandedContent.module.less'

interface TooltipRowProps {
  label: string
  value: number
}
const TooltipRow: FC<TooltipRowProps> = ({ label, value }) => (
  <div className={styles.tooltipRow}>
    <span className={styles.tooltipRowLabel}>{label}</span>
    <span className={styles.tooltipRowValue}>
      <DisplayValue value={value} />
    </span>
  </div>
)

interface BorrowCellProps {
  nft: TableNftData
  tokenType: LendingTokenType
}

export const BorrowCell: FC<BorrowCellProps> = ({ nft, tokenType }) => {
  const loanValueWithProtocolFee = calculateBorrowValueWithProtocolFee(nft.loanValue)
  const collectionFloor = nft.nft.nft.collectionFloor
  const ltv = (loanValueWithProtocolFee / collectionFloor) * 100

  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <TooltipRow label="Floor" value={collectionFloor} />
      <div className={styles.tooltipRow}>
        <span className={styles.tooltipRowLabel}>LTV</span>
        <span className={classNames(styles.ltvValue, styles.tooltipRowValue)}>
          {createPercentValueJSX(ltv)}
        </span>
      </div>
    </div>
  )

  const borrowValueRentFeeAdjusted = adjustBorrowValueWithSolanaRentFee({
    value: new BN(loanValueWithProtocolFee),
    marketPubkey: nft.nft.loan.marketPubkey,
    tokenType,
  }).toNumber()

  return (
    <HorizontalCell
      value={<DisplayValue value={borrowValueRentFeeAdjusted} placeholder="--" />}
      tooltipContent={tooltipContent}
    />
  )
}

interface APRCellProps {
  nft: TableNftData
}

export const APRCell: FC<APRCellProps> = ({ nft }) => {
  const apr = calculateApr({
    loanValue: nft.loanValue,
    collectionFloor: nft.nft.nft.collectionFloor,
    marketPubkey: nft.nft.loan.marketPubkey,
  })

  const weeklyFee = calculateCurrentInterestSolPure({
    loanValue: nft.loanValue,
    startTime: 0,
    currentTime: SECONDS_IN_DAY * 7,
    rateBasePoints: apr + BONDS.REPAY_FEE_APR,
  })

  const formattedAprValue = createPercentValueJSX((apr + BONDS.REPAY_FEE_APR) / 100)

  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <TooltipRow label="Weekly fee" value={weeklyFee} />
    </div>
  )

  return <HorizontalCell value={formattedAprValue} tooltipContent={tooltipContent} isHighlighted />
}
