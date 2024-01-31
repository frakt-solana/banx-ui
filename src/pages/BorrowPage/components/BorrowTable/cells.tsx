import { FC } from 'react'

import { BASE_POINTS } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  calculateCurrentInterestSolPure,
  calculateDynamicApr,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { RowCell, createPercentValueJSX, createSolValueJSX } from '@banx/components/TableComponents'

import { BONDS, DYNAMIC_APR, SECONDS_IN_DAY } from '@banx/constants'
import {
  calcBorrowValueWithProtocolFee,
  calcBorrowValueWithRentFee,
  formatDecimal,
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
    {createSolValueJSX(value, 1e9, '0◎', formatDecimal)}
  </div>
)

interface CellProps {
  nft: TableNftData
}
export const BorrowCell: FC<CellProps> = ({ nft }) => {
  const loanValueWithProtocolFee = calcBorrowValueWithProtocolFee(nft.loanValue)
  const collectionFloor = nft.nft.nft.collectionFloor
  const ltv = (loanValueWithProtocolFee / collectionFloor) * 100

  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <TooltipRow label="Floor" value={collectionFloor} />
      <div className={styles.tooltipRow}>
        <span className={styles.tooltipRowLabel}>LTV</span>
        <span className={styles.ltvValue}>{createPercentValueJSX(ltv)}</span>
      </div>
    </div>
  )

  const borrowValueWithRentFee = calcBorrowValueWithRentFee(
    loanValueWithProtocolFee,
    nft.nft.loan.marketPubkey,
  )

  const formattedBorrowValue = createSolValueJSX(borrowValueWithRentFee, 1e9, '--', formatDecimal)

  return <RowCell value={formattedBorrowValue} tooltipContent={tooltipContent} />
}

export const APRCell: FC<CellProps> = ({ nft }) => {
  const apr = calculateDynamicApr(
    Math.floor((nft.loanValue / nft.nft.nft.collectionFloor) * BASE_POINTS),
    DYNAMIC_APR,
  )

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

  return <RowCell value={formattedAprValue} tooltipContent={tooltipContent} isHighlighted />
}
