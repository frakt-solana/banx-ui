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
import { SECONDS_IN_72_HOURS } from '@banx/constants'
import {
  HealthColorIncreasing,
  LoanStatus,
  STATUS_LOANS_COLOR_MAP,
  STATUS_LOANS_MAP,
  calculateLentTokenValueWithInterest,
  calculateTimeFromNow,
  calculateTokenLoanAccruedInterest,
  calculateTokenLoanLtvByLoanValue,
  calculateTokenLoanValueWithUpfrontFee,
  getColorByPercent,
  isTokenLoanActive,
  isTokenLoanLiquidated,
  isTokenLoanSelling,
  isTokenLoanTerminating,
} from '@banx/utils'

import styles from '../ActiveLoansTable.module.less'

interface ClaimCellProps {
  loan: core.TokenLoan
}

export const ClaimCell: FC<ClaimCellProps> = ({ loan }) => {
  const accruedInterest = calculateTokenLoanAccruedInterest(loan)
  const lentTokenValueWithInterest = calculateLentTokenValueWithInterest(loan)

  const totalRepaidAmount = loan.totalRepaidAmount || 0
  const lentValue = totalRepaidAmount + calculateTokenLoanValueWithUpfrontFee(loan).toNumber()

  const tooltipContent = (
    <div className={styles.tooltipContainer}>
      {createTooltipContent('Lent', lentValue)}
      {createTooltipContent('Accrued interest', accruedInterest.toNumber())}
    </div>
  )

  return (
    <HorizontalCell
      tooltipContent={tooltipContent}
      value={<DisplayValue value={lentTokenValueWithInterest.toNumber()} />}
    />
  )
}

const createTooltipContent = (label: string, value: number) => (
  <div className={styles.tooltipContent}>
    <span className={styles.tooltipRowLabel}>{label}</span>
    <span className={styles.tooltipRowValue}>
      <DisplayValue value={value} />
    </span>
  </div>
)

export const LTVCell: FC<{ loan: core.TokenLoan }> = ({ loan }) => {
  const lentTokenValueWithInterest = calculateLentTokenValueWithInterest(loan).toNumber()
  const ltvPercent = calculateTokenLoanLtvByLoanValue(loan, lentTokenValueWithInterest)

  return (
    <HorizontalCell
      textColor={getColorByPercent(ltvPercent, HealthColorIncreasing)}
      value={createPercentValueJSX(ltvPercent, '0%')}
    />
  )
}

interface StatusCellProps {
  loan: core.TokenLoan
  isCardView?: boolean
}

export const StatusCell: FC<StatusCellProps> = ({ loan, isCardView = false }) => {
  const loanStatus = getLoanStatus(loan)
  const loanStatusColor = STATUS_LOANS_COLOR_MAP[loanStatus]
  const timeContent = getTimeContent(loan)

  const statusInfoTitle = <span className={styles.statusInfoTitle}>{timeContent}</span>
  const statusInfoSubtitle = (
    <span style={{ color: loanStatusColor }} className={styles.statusInfoSubtitle}>
      {capitalize(loanStatus)}
    </span>
  )

  return !isCardView ? (
    <div className={styles.statusInfo}>
      {statusInfoSubtitle}
      {statusInfoTitle}
    </div>
  ) : (
    <span>
      {statusInfoSubtitle} ({statusInfoTitle})
    </span>
  )
}

const getLoanStatus = (loan: core.TokenLoan) => {
  if (isTokenLoanLiquidated(loan)) {
    return LoanStatus.Liquidated
  }

  return STATUS_LOANS_MAP[loan.bondTradeTransaction.bondTradeTransactionState]
}

const getTimeContent = (loan: core.TokenLoan) => {
  if (isTokenLoanTerminating(loan) && !isTokenLoanLiquidated(loan)) {
    const expiredAt = loan.fraktBond.refinanceAuctionStartedAt + SECONDS_IN_72_HOURS

    return <Timer expiredAt={expiredAt} />
  }

  if (isTokenLoanActive(loan) || isTokenLoanLiquidated(loan) || isTokenLoanSelling(loan)) {
    const currentTimeInSeconds = moment().unix()
    const timeSinceActivationInSeconds = currentTimeInSeconds - loan.bondTradeTransaction.soldAt

    return calculateTimeFromNow(timeSinceActivationInSeconds)
  }

  return ''
}
