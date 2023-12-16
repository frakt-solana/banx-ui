import { FC } from 'react'

import { InfoCircleOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { createPercentValueJSX, createSolValueJSX } from '@banx/components/TableComponents'
import Tooltip from '@banx/components/Tooltip/Tooltip'

import { Loan } from '@banx/api/core'
import { BONDS, SECONDS_IN_DAY } from '@banx/constants'
import {
  HealthColorIncreasing,
  calcBorrowValueWithProtocolFee,
  calcLoanBorrowedAmount,
  calculateLoanRepayValue,
  formatDecimal,
  getColorByPercent,
} from '@banx/utils'

import styles from '../LoansActiveTable.module.less'

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
  loan: Loan
}

export const DebtCell: FC<CellProps> = ({ loan }) => {
  const { totalRepaidAmount = 0, accruedInterest = 0, bondTradeTransaction, fraktBond } = loan
  const { soldAt, amountOfBonds, solAmount, feeAmount } = bondTradeTransaction || {}

  const debtValue = calculateLoanRepayValue(loan)
  const borrowedValue = fraktBond.borrowedAmount - totalRepaidAmount
  const upfrontFee = borrowedValue - calcBorrowValueWithProtocolFee(borrowedValue)

  const totalAccruedInterest = debtValue - solAmount + feeAmount + accruedInterest

  const weeklyFee = calculateCurrentInterestSolPure({
    loanValue: calcLoanBorrowedAmount(loan),
    startTime: soldAt,
    currentTime: soldAt + SECONDS_IN_DAY * 7,
    rateBasePoints: amountOfBonds + BONDS.PROTOCOL_REPAY_FEE,
  })

  const formattedDebtValue = createSolValueJSX(debtValue, 1e9, '0◎', formatDecimal)

  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <TooltipRow label="Principal" value={borrowedValue} />
      <TooltipRow label="Repaid" value={totalRepaidAmount} />
      <TooltipRow label="Accrued interest" value={totalAccruedInterest} />
      <TooltipRow label="Upfront fee" value={upfrontFee} />
      <TooltipRow label="Est. weekly fee" value={weeklyFee} />
    </div>
  )

  return (
    <div className={styles.cellInfo}>
      <Tooltip title={tooltipContent}>
        <span className={styles.cellInfoTitle}>{formattedDebtValue}</span>
        <InfoCircleOutlined className={styles.tooltipIcon} />
      </Tooltip>
    </div>
  )
}

export const LTVCell: FC<CellProps> = ({ loan }) => {
  const debtValue = calculateLoanRepayValue(loan)
  const collectionFloor = loan.nft.collectionFloor

  const ltvPercent = (debtValue / collectionFloor) * 100
  const formattedLtvValue = createPercentValueJSX(ltvPercent)

  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <TooltipRow label="Floor" value={collectionFloor} />
      <TooltipRow label="Debt" value={debtValue} />
    </div>
  )

  return (
    <div className={styles.cellInfo}>
      <Tooltip title={tooltipContent}>
        <span
          style={{ color: getColorByPercent(ltvPercent, HealthColorIncreasing) }}
          className={classNames(styles.cellInfoTitle, { [styles.highlight]: true })}
        >
          {formattedLtvValue}
        </span>
        <InfoCircleOutlined className={styles.tooltipIcon} />
      </Tooltip>
    </div>
  )
}

export const APRCell: FC<CellProps> = ({ loan }) => {
  const aprWithProtocolFee = loan.bondTradeTransaction.amountOfBonds + BONDS.PROTOCOL_REPAY_FEE
  const formattedAprValue = createPercentValueJSX(aprWithProtocolFee / 100)

  return (
    <span className={classNames(styles.cellInfoTitle, { [styles.highlight]: true })}>
      {formattedAprValue}
    </span>
  )
}
