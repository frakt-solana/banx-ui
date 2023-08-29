import { FC } from 'react'

import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'

interface InterestCellProps {
  loan: Loan
}

export const InterestCell: FC<InterestCellProps> = ({ loan }) => {
  const { solAmount, feeAmount, amountOfBonds, soldAt } = loan.bondTradeTransaction || {}

  const loanValue = solAmount + feeAmount

  const calculatedInterest = calculateCurrentInterestSolPure({
    loanValue,
    startTime: soldAt,
    currentTime: moment().unix(),
    rateBasePoints: amountOfBonds,
  })

  return createSolValueJSX(calculatedInterest, 1e9)
}
