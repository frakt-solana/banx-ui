import { BN } from 'fbonds-core'
import { BASE_POINTS, PROTOCOL_FEE_BN } from 'fbonds-core/lib/fbond-protocol/constants'
import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { sumBy } from 'lodash'
import moment from 'moment'

import { BorrowOffer, CollateralToken } from '@banx/api/tokens'
import { BONDS, SECONDS_IN_DAY } from '@banx/constants'
import { ZERO_BN, bnToHuman, calcWeightedAverage, stringToBN } from '@banx/utils'

interface GetErrorMessageProps {
  collateralToken: CollateralToken | undefined
  collateralInputValue: string
  borrowInputValue: string
  offers: BorrowOffer[]
  isLoadingOffers: boolean
}

export const getErrorMessage = ({
  collateralToken,
  collateralInputValue,
  borrowInputValue,
  offers,
  isLoadingOffers,
}: GetErrorMessageProps) => {
  const ticker = collateralToken?.collateral.ticker || ''

  const collateralTokenBalance = bnToHuman(
    new BN(collateralToken?.amountInWallet || 0),
    collateralToken?.collateral.decimals,
  ).toString()

  const isInvalidAmount =
    stringToBN(collateralInputValue).eq(ZERO_BN) && stringToBN(borrowInputValue).eq(ZERO_BN)

  const noEnoughtWalletBalance = stringToBN(collateralTokenBalance).eq(ZERO_BN)
  const hasInsufficientBalance = stringToBN(collateralInputValue).gt(
    stringToBN(collateralTokenBalance),
  )

  const noOffersAvailable = offers.length === 0 && !isLoadingOffers

  if (isInvalidAmount) {
    return 'Enter an amount'
  }

  if (noOffersAvailable) {
    return 'Not found suitable offers'
  }

  if (noEnoughtWalletBalance) {
    return `You don't have ${ticker} to borrow`
  }

  if (hasInsufficientBalance) {
    return ticker ? `Not enough ${ticker}` : ''
  }

  return ''
}

export const getSummaryInfo = (offers: BorrowOffer[]) => {
  const totalAmountToGet = new BN(sumBy(offers, (offer) => parseFloat(offer.maxTokenToGet)))

  const upfrontFee = totalAmountToGet.div(new BN(100)).toNumber()

  const aprRateArray = offers.map((offer) => parseFloat(offer.apr) + BONDS.PROTOCOL_REPAY_FEE)

  const amountToGetArray = offers.map((offer) => parseFloat(offer.maxTokenToGet))

  const weightedApr = calcWeightedAverage(aprRateArray, amountToGetArray)

  const ltvRateArray = offers.map((offer) => parseFloat(offer.ltv))
  const weightedLtv = calcWeightedAverage(ltvRateArray, amountToGetArray)

  const weeklyFee = calculateCurrentInterestSolPure({
    loanValue: totalAmountToGet.toNumber(),
    startTime: moment().unix(),
    currentTime: moment().unix() + SECONDS_IN_DAY * 7,
    rateBasePoints: weightedApr + BONDS.PROTOCOL_REPAY_FEE,
  })

  return { upfrontFee, weightedApr, weightedLtv, weeklyFee }
}

const UPFRONT_FEE_BN = PROTOCOL_FEE_BN
const BASE_POINTS_BN = new BN(BASE_POINTS)

export const adjustAmountWithUpfrontFee = (amount: BN): BN => {
  const FRACTION = BASE_POINTS_BN.sub(UPFRONT_FEE_BN) //? 9900

  return amount.mul(FRACTION).div(BASE_POINTS_BN)
}

type GetButtonActionTextProps = {
  isLoading: boolean
  isWalletConnected: boolean
  errorMessage?: string
}

export const getButtonActionText = ({
  isLoading,
  isWalletConnected,
  errorMessage,
}: GetButtonActionTextProps) => {
  if (!isWalletConnected) {
    return 'Connect wallet'
  }

  if (errorMessage) {
    return errorMessage
  }

  if (isLoading && !errorMessage) {
    return 'Fetching...'
  }

  return 'Borrow'
}