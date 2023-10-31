import { FC } from 'react'

import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { formatDecimal } from '@banx/utils'

interface InterestCellProps {
  loan: Loan
}

export const InterestCell: FC<InterestCellProps> = ({ loan }) => {
  const { solAmount, feeAmount, amountOfBonds, soldAt } = loan.bondTradeTransaction || {}

  const loanValueWithFee = solAmount + feeAmount

  const calculatedInterest = calculateCurrentInterestSolPure({
    loanValue: loanValueWithFee,
    startTime: soldAt,
    currentTime: moment().unix(),
    rateBasePoints: amountOfBonds + BONDS.PROTOCOL_REPAY_FEE,
  })

  return createSolValueJSX(calculatedInterest + loanValueWithFee, 1e9, '--', formatDecimal)
}
