import { BN } from 'fbonds-core'
import { BASE_POINTS, PROTOCOL_FEE_BN } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  calculateAPRforOffer,
  calculateCurrentInterestSolPure,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { sumBy } from 'lodash'
import moment from 'moment'

import { BorrowSplTokenOffers, CollateralToken } from '@banx/api/tokens'
import { BONDS, SECONDS_IN_DAY } from '@banx/constants'
import { ZERO_BN, bnToHuman, calcWeightedAverage, stringToBN } from '@banx/utils'

import { BorrowToken } from '../constants'

interface GetErrorMessageProps {
  collateralToken: CollateralToken | undefined
  collateralInputValue: string
  borrowInputValue: string
  offers: BorrowSplTokenOffers[]
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
  const noOffersAvailable = offers.length === 0 || isLoadingOffers

  if (noOffersAvailable) {
    return 'Not enough liquidity'
  }

  if (noEnoughtWalletBalance) {
    return `You don't have ${ticker} to borrow`
  }

  if (isInvalidAmount) {
    return 'Enter an amount'
  }

  if (hasInsufficientBalance) {
    return ticker ? `Not enough ${ticker}` : ''
  }

  return ''
}

export const getSummaryInfo = (
  offers: BorrowSplTokenOffers[],
  collateralToken: CollateralToken,
  borrowToken: BorrowToken,
) => {
  const totalAmountToGet = new BN(sumBy(offers, (offer) => parseFloat(offer.amountToGet)))

  const upfrontFee = totalAmountToGet.div(new BN(100)).toNumber()

  const aprRateArray = offers.map(
    (offer) =>
      calculateTokenBorrowApr({ offer, collateralToken, borrowToken }) + BONDS.PROTOCOL_REPAY_FEE,
  )
  const amountToGetArray = offers.map((offer) => parseFloat(offer.amountToGet))

  const weightedApr = calcWeightedAverage(aprRateArray, amountToGetArray)

  const weeklyFee = calculateCurrentInterestSolPure({
    loanValue: totalAmountToGet.toNumber(),
    startTime: moment().unix(),
    currentTime: moment().unix() + SECONDS_IN_DAY * 7,
    rateBasePoints: weightedApr + BONDS.PROTOCOL_REPAY_FEE,
  })

  return { upfrontFee, weightedApr, weeklyFee }
}

type CalculateTokenBorrowApr = (props: {
  offer: BorrowSplTokenOffers
  collateralToken: CollateralToken
  borrowToken: BorrowToken
}) => number

export const calculateTokenBorrowApr: CalculateTokenBorrowApr = ({
  offer,
  collateralToken,
  borrowToken,
}) => {
  const amountToGet = bnToHuman(
    new BN(parseFloat(offer.amountToGet)),
    borrowToken.collateral.decimals,
  )

  const amountToGive = bnToHuman(
    new BN(parseFloat(offer.amountToGive)),
    collateralToken.collateral.decimals,
  )

  const collateralPerToken = amountToGet / amountToGive

  const ltvPercent = (collateralPerToken / collateralToken.collateralPrice) * 100

  const fullyDilutedValuationNumber = parseFloat(
    collateralToken.collateral.fullyDilutedValuationInMillions,
  )

  const { factoredApr } = calculateAPRforOffer(ltvPercent, fullyDilutedValuationNumber)
  const aprRate = factoredApr * 100

  return aprRate || 0
}

const UPFRONT_FEE_BN = PROTOCOL_FEE_BN
const BASE_POINTS_BN = new BN(BASE_POINTS)

export const adjustAmountWithUpfrontFee = (amount: BN, type: 'input' | 'output'): BN => {
  const FRACTION = BASE_POINTS_BN.sub(UPFRONT_FEE_BN) //? 9900

  if (type === 'input') {
    return amount.mul(FRACTION).div(BASE_POINTS_BN)
  }
  return amount.mul(BASE_POINTS_BN).div(FRACTION)
}
