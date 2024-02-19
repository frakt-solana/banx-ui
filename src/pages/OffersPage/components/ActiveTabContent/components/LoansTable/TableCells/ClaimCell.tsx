import { FC } from 'react'

import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'

import { HorizontalCell, createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { calculateClaimValue, calculateLentValue } from '@banx/pages/OffersPage'
import { calcLoanBorrowedAmount, formatDecimal } from '@banx/utils'

import styles from '../LoansTable.module.less'

interface ClaimCellProps {
  loan: Loan
}

export const ClaimCell: FC<ClaimCellProps> = ({ loan }) => {
  const { amountOfBonds, soldAt } = loan.bondTradeTransaction

  const loanBorrowedAmount = calcLoanBorrowedAmount(loan)

  const interestParameters = {
    loanValue: loanBorrowedAmount,
    startTime: soldAt,
    currentTime: moment().unix(),
    rateBasePoints: amountOfBonds,
  }

  const currentInterest = calculateCurrentInterestSolPure(interestParameters)
  const claimValue = calculateClaimValue(loan)
  const lentValue = calculateLentValue(loan)

  const tooltopContent = (
    <div className={styles.tooltipContainer}>
      {createTooltipContent('Lent', lentValue)}
      {createTooltipContent('Accrued interest', currentInterest)}
    </div>
  )

  return (
    <HorizontalCell
      tooltipContent={tooltopContent}
      value={createSolValueJSX(claimValue, 1e9, '0◎', formatDecimal)}
    />
  )
}

const createTooltipContent = (label: string, value: number) => (
  <div className={styles.tooltipContent}>
    <span>{label}</span>
    <span>{createSolValueJSX(value, 1e9, '0◎', formatDecimal)}</span>
  </div>
)
