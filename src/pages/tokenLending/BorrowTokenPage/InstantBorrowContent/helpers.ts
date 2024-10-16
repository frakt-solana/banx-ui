import { BN, web3 } from 'fbonds-core'
import { BASE_POINTS, PROTOCOL_FEE_TOKEN_BN } from 'fbonds-core/lib/fbond-protocol/constants'
import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { calcBorrowerTokenAPR } from 'fbonds-core/lib/fbond-protocol/helpers'
import moment from 'moment'

import { BorrowOffer, CollateralToken } from '@banx/api/tokens'
import { SECONDS_IN_DAY } from '@banx/constants'
import {
  ZERO_BN,
  adjustTokenAmountWithUpfrontFee,
  bnToHuman,
  calcWeightedAverage,
  stringToBN,
  sumBNs,
} from '@banx/utils'

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
    new BN(String(collateralToken?.amountInWallet || 0)),
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
    return 'Enter your amount of collateral'
  }

  if (noOffersAvailable) {
    return 'No suitable offers'
  }

  if (noEnoughtWalletBalance) {
    return `You don't have ${ticker} to borrow`
  }

  if (hasInsufficientBalance) {
    return ticker ? `Not enough ${ticker}` : ''
  }

  return ''
}

export const getSummaryInfo = (offers: BorrowOffer[], marketPubkey: string) => {
  const totalAmountToGet = sumBNs(offers.map((offer) => new BN(offer.maxTokenToGet)))
  const totalCollateralsAmount = sumBNs(offers.map((offer) => new BN(offer.maxCollateralToReceive)))

  const upfrontFee = totalAmountToGet.mul(PROTOCOL_FEE_TOKEN_BN).div(new BN(BASE_POINTS)).toNumber()

  const amountToGetArray = offers.map((offer) => parseFloat(offer.maxTokenToGet))

  const aprRateArray = offers.map((offer) =>
    calcBorrowerTokenAPR(parseFloat(offer.apr), new web3.PublicKey(marketPubkey)),
  )

  const weightedApr = calcWeightedAverage(aprRateArray, amountToGetArray)

  const ltvRateArray = offers.map((offer) => parseFloat(offer.ltv))
  const weightedLtv = calcWeightedAverage(ltvRateArray, amountToGetArray)

  const weeklyFee = calculateCurrentInterestSolPure({
    loanValue: totalAmountToGet.toNumber(),
    startTime: moment().unix(),
    currentTime: moment().unix() + SECONDS_IN_DAY * 7,
    rateBasePoints: weightedApr,
  })

  const adjustedTotalAmountToGet = adjustTokenAmountWithUpfrontFee(totalAmountToGet)

  return {
    upfrontFee,
    weightedApr,
    weightedLtv,
    weeklyFee,
    totalAmountToGet: adjustedTotalAmountToGet.toNumber(),
    totalCollateralsAmount: totalCollateralsAmount.toNumber(),
  }
}

type GetButtonActionTextProps = {
  isWalletConnected: boolean
  errorMessage?: string
}

export const getButtonActionText = ({
  isWalletConnected,
  errorMessage,
}: GetButtonActionTextProps) => {
  if (!isWalletConnected) {
    return 'Connect wallet'
  }

  if (errorMessage) {
    return errorMessage
  }

  return 'Borrow'
}
