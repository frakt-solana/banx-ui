import { FC } from 'react'

import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'

import { createSolValueJSX } from '@banx/components/TableCells'

import { Loan } from '@banx/api/core'

export const RepayValueCell: FC<{ loan: Loan }> = ({ loan }) => {
  const { solAmount, soldAt, amountOfBonds } = loan.bondTradeTransaction || {}

  const calculatedInterest = calculateCurrentInterestSolPure({
    loanValue: solAmount,
    startTime: soldAt,
    currentTime: moment().unix(),
    rateBasePoints: amountOfBonds,
  })

  const repayValue = solAmount + calculatedInterest

  return createSolValueJSX(repayValue, 1e9)
}
