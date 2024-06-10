import { FC } from 'react'

import { capitalize } from 'lodash'
import moment from 'moment'

import {
  DisplayValue,
  HorizontalCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'
import Timer from '@banx/components/Timer'

import { core } from '@banx/api/tokens'
import { BONDS, SECONDS_IN_72_HOURS } from '@banx/constants'
import {
  HealthColorIncreasing,
  STATUS_LOANS_COLOR_MAP,
  STATUS_LOANS_MAP,
  calculateTimeFromNow,
  getColorByPercent,
  isTokenLoanActive,
  isTokenLoanTerminating,
} from '@banx/utils'

import styles from '../LoansTokenActiveTable.module.less'

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

export const DebtCell: FC<{ loan: core.TokenLoan }> = ({ loan }) => {
  const { bondTradeTransaction } = loan

  const debtValue = 0
  const borrowedValue = 0
  const totalAccruedInterest = 0
  const upfrontFee = 0
  const weeklyFee = 0

  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <TooltipRow label="Principal" value={borrowedValue} />
      <TooltipRow label="Repaid" value={bondTradeTransaction.borrowerFullRepaidAmount} />
      <TooltipRow label="Accrued interest" value={totalAccruedInterest + upfrontFee} />
      <TooltipRow label="Upfront fee" value={upfrontFee} />
      <TooltipRow label="Est. weekly interest" value={weeklyFee} />
    </div>
  )

  return (
    <HorizontalCell tooltipContent={tooltipContent} value={<DisplayValue value={debtValue} />} />
  )
}

export const LTVCell: FC<{ loan: core.TokenLoan }> = () => {
  const debtValue = 0
  const collectionFloor = 0

  const ltvPercent = (debtValue / collectionFloor) * 100

  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <TooltipRow label="Floor" value={collectionFloor} />
      <TooltipRow label="Debt" value={debtValue} />
    </div>
  )

  return (
    <HorizontalCell
      value={createPercentValueJSX(ltvPercent)}
      tooltipContent={tooltipContent}
      textColor={getColorByPercent(ltvPercent, HealthColorIncreasing)}
    />
  )
}

export const APRCell: FC<{ loan: core.TokenLoan }> = ({ loan }) => {
  const apr = (loan.bondTradeTransaction.amountOfBonds + BONDS.PROTOCOL_REPAY_FEE) / 100

  return <HorizontalCell value={createPercentValueJSX(apr)} isHighlighted />
}

interface StatusCellProps {
  loan: core.TokenLoan
  isCardView?: boolean
}

export const StatusCell: FC<StatusCellProps> = ({ loan, isCardView = false }) => {
  const loanStatus = STATUS_LOANS_MAP[loan.bondTradeTransaction.bondTradeTransactionState]
  const loanStatusColor = STATUS_LOANS_COLOR_MAP[loanStatus]

  const timeContent = getTimeContent(loan)

  const statusInfoTitle = (
    <span style={{ color: loanStatusColor }} className={styles.columnCellTitle}>
      {capitalize(loanStatus)}
    </span>
  )
  const statusInfoSubtitle = <span className={styles.columnCellSubtitle}>{timeContent}</span>

  return !isCardView ? (
    <div className={styles.columnCell}>
      {statusInfoSubtitle}
      {statusInfoTitle}
    </div>
  ) : (
    <span>
      {statusInfoSubtitle} ({statusInfoTitle})
    </span>
  )
}

const getTimeContent = (loan: core.TokenLoan) => {
  const { fraktBond } = loan

  if (isTokenLoanActive(loan)) {
    const currentTimeInSeconds = moment().unix()
    const timeSinceActivationInSeconds = currentTimeInSeconds - fraktBond.activatedAt
    return calculateTimeFromNow(timeSinceActivationInSeconds)
  }

  if (isTokenLoanTerminating(loan)) {
    const expiredAt = fraktBond.refinanceAuctionStartedAt + SECONDS_IN_72_HOURS
    return <Timer expiredAt={expiredAt} />
  }

  return ''
}
