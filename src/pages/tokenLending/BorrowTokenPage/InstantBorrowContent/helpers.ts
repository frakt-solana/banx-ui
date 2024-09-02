import { BN } from 'fbonds-core'
import { BASE_POINTS, PROTOCOL_FEE_BN } from 'fbonds-core/lib/fbond-protocol/constants'
import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'

import { BorrowOffer, CollateralToken } from '@banx/api/tokens'
import { SECONDS_IN_DAY } from '@banx/constants'
import { ZERO_BN, bnToHuman, calcWeightedAverage, stringToBN, sumBNs } from '@banx/utils'

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
  const totalAmountToGet = sumBNs(offers.map((offer) => new BN(offer.maxTokenToGet)))
  const totalCollateralsAmount = sumBNs(offers.map((offer) => new BN(offer.maxCollateralToReceive)))

  const upfrontFee = totalAmountToGet.div(new BN(100)).toNumber()

  const amountToGetArray = offers.map((offer) => parseFloat(offer.maxTokenToGet))

  const aprRateArray = offers.map((offer) => parseFloat(offer.apr))
  const weightedApr = calcWeightedAverage(aprRateArray, amountToGetArray)

  const ltvRateArray = offers.map((offer) => parseFloat(offer.ltv))
  const weightedLtv = calcWeightedAverage(ltvRateArray, amountToGetArray)

  const weeklyFee = calculateCurrentInterestSolPure({
    loanValue: totalAmountToGet.toNumber(),
    startTime: moment().unix(),
    currentTime: moment().unix() + SECONDS_IN_DAY * 7,
    rateBasePoints: weightedApr,
  })

  const adjustedTotalAmountToGet = adjustAmountWithUpfrontFee(totalAmountToGet)

  return {
    upfrontFee,
    weightedApr,
    weightedLtv,
    weeklyFee,
    totalAmountToGet: adjustedTotalAmountToGet.toNumber(),
    totalCollateralsAmount: totalCollateralsAmount.toNumber(),
  }
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
