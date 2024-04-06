import { FC } from 'react'

import classNames from 'classnames'
import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import {
  DisplayValue,
  HorizontalCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'

import { BONDS, SECONDS_IN_DAY } from '@banx/constants'
import {
  calcBorrowValueWithProtocolFee, // calcBorrowValueWithRentFee,
  calculateApr,
} from '@banx/utils'

import { TableNftData } from './types'

import styles from './BorrowTable.module.less'

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

interface CellProps {
  nft: TableNftData
}
export const BorrowCell: FC<CellProps> = ({ nft }) => {
  //TODO: Recalc fees for usdc loans
  const loanValueWithProtocolFee = calcBorrowValueWithProtocolFee(nft.loanValue)
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

  // const borrowValueWithRentFee = calcBorrowValueWithRentFee(
  //   loanValueWithProtocolFee,
  //   nft.nft.loan.marketPubkey,
  // )

  return (
    <HorizontalCell
      value={<DisplayValue value={nft.loanValue} placeholder="--" />}
      tooltipContent={tooltipContent}
    />
  )
}

export const APRCell: FC<CellProps> = ({ nft }) => {
  const apr = calculateApr({
    loanValue: nft.loanValue,
    collectionFloor: nft.nft.nft.collectionFloor,
    marketPubkey: nft.nft.loan.marketPubkey,
  })

  const weeklyFee = calculateCurrentInterestSolPure({
    loanValue: nft.loanValue,
    startTime: 0,
    currentTime: SECONDS_IN_DAY * 7,
    rateBasePoints: apr + BONDS.PROTOCOL_REPAY_FEE,
  })

  const formattedAprValue = createPercentValueJSX((apr + BONDS.PROTOCOL_REPAY_FEE) / 100)

  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <TooltipRow label="Weekly fee" value={weeklyFee} />
    </div>
  )

  return <HorizontalCell value={formattedAprValue} tooltipContent={tooltipContent} isHighlighted />
}
