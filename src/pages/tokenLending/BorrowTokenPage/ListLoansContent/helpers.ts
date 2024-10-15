import { web3 } from 'fbonds-core'
import {
  BASE_POINTS,
  MAX_APR_SPL,
  MIN_APR_SPL,
  PROTOCOL_FEE_TOKEN,
} from 'fbonds-core/lib/fbond-protocol/constants'
import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { calcBorrowerTokenAPR } from 'fbonds-core/lib/fbond-protocol/helpers'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import moment from 'moment'

import { CollateralToken } from '@banx/api/tokens'
import { DAYS_IN_YEAR, ONE_WEEK_IN_SECONDS } from '@banx/constants'
import { getTokenDecimals } from '@banx/utils'

interface GetSummaryProps {
  collateralAmount: number
  borrowAmount: number
  apr: number

  collateralToken: CollateralToken | undefined
  tokenType: LendingTokenType
}

export const getSummaryInfo = ({
  collateralAmount,
  borrowAmount,
  apr,
  collateralToken,
  tokenType,
}: GetSummaryProps) => {
  const marketTokenDecimals = getTokenDecimals(tokenType)

  const collateralPrice = collateralToken?.collateralPrice || 0
  const adjustedBorrowAmount = borrowAmount * marketTokenDecimals

  const ltvRatio = adjustedBorrowAmount / collateralAmount
  const ltvPercent = (ltvRatio / collateralPrice) * 100 || 0

  const upfrontFee = (adjustedBorrowAmount * PROTOCOL_FEE_TOKEN) / BASE_POINTS || 0

  const currentTimeInSeconds = moment().unix()
  const weeklyFee = calculateCurrentInterestSolPure({
    loanValue: adjustedBorrowAmount,
    startTime: currentTimeInSeconds,
    currentTime: currentTimeInSeconds + ONE_WEEK_IN_SECONDS,
    rateBasePoints: apr * 100,
  })

  return {
    ltvPercent,
    upfrontFee,
    weeklyFee,
  }
}

interface GetInputErrorMessageProps {
  collateralToken: CollateralToken | undefined
  collateralAmount: number
  borrowAmount: number
  freezeDuration: number
  apr: number
}

export const getInputErrorMessage = ({
  collateralToken,
  collateralAmount,
  borrowAmount,
  freezeDuration,
  apr,
}: GetInputErrorMessageProps) => {
  const MIN_APR = Math.round(calcBorrowerTokenAPR(MIN_APR_SPL, web3.PublicKey.default) / 100)
  const MAX_APR = MAX_APR_SPL / 100

  const isCollateralInsufficient = isBalanceInsufficient(collateralToken, collateralAmount)

  const isCollateralEmpty = isNaN(collateralAmount)
  const isBorrowAmountEmpty = isNaN(borrowAmount)
  const isAprEmpty = isNaN(apr)

  const isAprTooLow = apr < MIN_APR
  const isAprTooHigh = apr > MAX_APR

  const isFreezeValueTooHigh = freezeDuration > DAYS_IN_YEAR

  const errorConditions: Array<[boolean, string]> = [
    [isCollateralInsufficient, `Not enough ${collateralToken?.collateral.ticker ?? ''}`],
    [isCollateralEmpty && isBorrowAmountEmpty, 'Enter a value'],
    [isCollateralEmpty, 'Enter collateral amount'],
    [isBorrowAmountEmpty, 'Enter borrow amount'],
    [isAprEmpty, 'Enter APR value'],
    [isFreezeValueTooHigh, `Max freeze period is ${DAYS_IN_YEAR} days`],
    [isAprTooLow, `Min APR is ${MIN_APR}%`],
    [isAprTooHigh, `Max APR is ${MAX_APR}%`],
  ]

  const errorMessage = errorConditions.find(([condition]) => condition)?.[1] ?? ''

  const hasAprErrorMessage = isAprTooLow || isAprTooHigh

  return { errorMessage, hasAprErrorMessage }
}

export const isBalanceInsufficient = (
  collateralToken: CollateralToken | undefined,
  collateralAmount: number,
): boolean => {
  if (!collateralToken) return true

  const collateralBalance =
    collateralToken.amountInWallet / Math.pow(10, collateralToken.collateral.decimals)

  return collateralAmount > collateralBalance
}
