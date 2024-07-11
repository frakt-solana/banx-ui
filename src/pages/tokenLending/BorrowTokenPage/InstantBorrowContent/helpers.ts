import { BN } from 'fbonds-core'
import {
  calculateAPRforOffer,
  calculateCurrentInterestSolPure,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'

import { BorrowSplTokenOffers, CollateralToken } from '@banx/api/tokens'
import { BONDS, SECONDS_IN_DAY } from '@banx/constants'
import { ZERO_BN, calcWeightedAverage, stringToBN } from '@banx/utils'

interface GetErrorMessageProps {
  collateralToken: CollateralToken | undefined
  collateralInputValue: string
  tokenWalletBalance: string
  offers: BorrowSplTokenOffers[]
  isLoadingOffers: boolean
}

export const getErrorMessage = ({
  collateralToken,
  collateralInputValue,
  tokenWalletBalance,
  offers,
  isLoadingOffers,
}: GetErrorMessageProps) => {
  const ticker = collateralToken?.meta.ticker || ''

  const isInvalidAmount = stringToBN(collateralInputValue).eq(ZERO_BN)
  const noEnoughtWalletBalance = stringToBN(tokenWalletBalance).eq(ZERO_BN)
  const hasInsufficientBalance = stringToBN(collateralInputValue).gt(stringToBN(tokenWalletBalance))
  const noOffersAvailable = offers.length === 0 || isLoadingOffers

  if (noEnoughtWalletBalance) {
    return `You don't have ${ticker} to borrow`
  }

  if (isInvalidAmount) {
    return 'Enter an amount'
  }

  if (hasInsufficientBalance) {
    return ticker ? `Not enough ${ticker}` : ''
  }

  if (noOffersAvailable) {
    return 'Not enough liquidity'
  }

  return ''
}

//TODO (TokenLending): Reduce to one field amountToGet
export const calculateTotalAmount = (
  offers: BorrowSplTokenOffers[],
  field: 'amountToGet' | 'amountToGive',
) => {
  return offers.reduce((acc, offer) => {
    return acc.add(new BN(offer[field], 'hex'))
  }, new BN(0))
}

export const getSummaryInfo = (
  offers: BorrowSplTokenOffers[],
  collateralToken: CollateralToken,
) => {
  const totalAmountToGet = calculateTotalAmount(offers, 'amountToGet')

  const upfrontFee = totalAmountToGet.div(new BN(100)).toNumber()

  const aprRateArray = offers.map((offer) => calculateTokenBorrowApr({ offer, collateralToken }))
  const amountToGetArray = offers.map((offer) => new BN(offer.amountToGet, 'hex').toNumber())
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
}) => number

export const calculateTokenBorrowApr: CalculateTokenBorrowApr = ({ offer, collateralToken }) => {
  const amountToGet = new BN(offer.amountToGet, 'hex')
  const amountToGive = new BN(offer.amountToGive, 'hex')

  const collateralPerToken = amountToGet.toNumber() / amountToGive.toNumber()
  const ltvPercent = collateralPerToken / collateralToken.collateralPrice

  const { apr } = calculateAPRforOffer(ltvPercent, collateralToken.meta.FDV)
  const aprRate = apr * 100

  return aprRate || 0
}
