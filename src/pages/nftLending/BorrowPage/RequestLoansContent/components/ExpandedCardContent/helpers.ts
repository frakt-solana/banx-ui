import { BN } from 'fbonds-core'
import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { clamp } from 'lodash'
import moment from 'moment'

import { BONDS, ONE_WEEK_IN_SECONDS } from '@banx/constants'
import { calculateBorrowValueWithProtocolFee } from '@banx/utils'

interface CalculateSummaryInfoProps {
  requestedLoanValue: number
  totalNftsToRequest: number
  inputAprValue: string
  collectionFloor: number
}

export const calculateSummaryInfo = ({
  requestedLoanValue,
  totalNftsToRequest,
  inputAprValue,
  collectionFloor,
}: CalculateSummaryInfoProps) => {
  const ltv = (requestedLoanValue / collectionFloor) * 100 || 0
  const totalRequestedLoanValue = requestedLoanValue * totalNftsToRequest

  const upfrontFee =
    totalRequestedLoanValue - calculateBorrowValueWithProtocolFee(new BN(totalRequestedLoanValue))

  const currentTimeUnix = moment().unix()
  const rateBasePoints = parseFloat(inputAprValue) * 100
  const weeklyInterest = calculateCurrentInterestSolPure({
    loanValue: totalRequestedLoanValue,
    startTime: currentTimeUnix - ONE_WEEK_IN_SECONDS,
    currentTime: currentTimeUnix,
    rateBasePoints: rateBasePoints + BONDS.PROTOCOL_REPAY_FEE,
  })

  return { ltv, upfrontFee, weeklyInterest }
}

export const clampInputValue = (value: string, max: number): string => {
  if (!value) return ''

  const valueToNumber = parseFloat(value)
  const clampedValue = clamp(valueToNumber, 0, max)
  return clampedValue.toString()
}
