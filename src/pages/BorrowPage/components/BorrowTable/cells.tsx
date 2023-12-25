import { FC } from 'react'

import { InfoCircleOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import { BASE_POINTS } from 'fbonds-core/lib/fbond-protocol/constants'
import { calculateDynamicApr } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { createPercentValueJSX, createSolValueJSX } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip'

import { BONDS } from '@banx/constants'
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

  return (
    <div className={styles.cellInfo}>
      <Tooltip title={tooltipContent}>
        <span className={styles.cellInfoTitle}>
          {createSolValueJSX(borrowValueWithRentFee, 1e9, '--', formatDecimal)}
        </span>
        <InfoCircleOutlined className={styles.tooltipIcon} />
      </Tooltip>
    </div>
  )
}

export const APRCell: FC<CellProps> = ({ nft }) => {
  const apr = calculateDynamicApr(
    Math.floor((nft.loanValue / nft.nft.nft.collectionFloor) * BASE_POINTS),
  )

  const formattedAprValue = createPercentValueJSX((apr + BONDS.PROTOCOL_REPAY_FEE) / 100)

  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <TooltipRow label="Weekly fee" value={nft.interest} />
    </div>
  )

  return (
    <div className={styles.cellInfo}>
      <Tooltip title={tooltipContent}>
        <span className={classNames(styles.cellInfoTitle, { [styles.highlight]: true })}>
          {formattedAprValue}
        </span>
        <InfoCircleOutlined className={styles.tooltipIcon} />
      </Tooltip>
    </div>
  )
}
