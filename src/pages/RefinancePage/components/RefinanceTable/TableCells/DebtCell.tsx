import { FC } from 'react'

import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'

import { createSolValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { formatDecimal } from '@banx/utils'

export const DebtCell: FC<{ loan: Loan }> = ({ loan }) => {
  const { solAmount, soldAt, feeAmount, amountOfBonds } = loan.bondTradeTransaction || {}

  const calculatedInterest = calculateCurrentInterestSolPure({
    loanValue: solAmount + feeAmount,
    startTime: soldAt,
    currentTime: moment().unix(),
    rateBasePoints: amountOfBonds + BONDS.PROTOCOL_REPAY_FEE,
  })

  const repayValue = solAmount + calculatedInterest + feeAmount

  return createSolValueJSX(repayValue, 1e9, '--', formatDecimal)
}
