import { BN } from 'fbonds-core'

import { BorrowSplTokenOffers } from '@banx/api/tokens'
import { ZERO_BN, stringToBN } from '@banx/utils'

import { BorrowCollateral } from '../constants'

interface GetErrorMessageProps {
  collateral: BorrowCollateral | undefined
  collaretalInputValue: string
  maxTokenValue: string
}

export const getErrorMessage = ({
  collateral,
  collaretalInputValue,
  maxTokenValue,
}: GetErrorMessageProps) => {
  const { ticker = '' } = collateral?.meta || {}

  const isInvalidAmount = stringToBN(collaretalInputValue).lte(ZERO_BN)
  const isInsufficientBalance = stringToBN(collaretalInputValue).gt(stringToBN(maxTokenValue))

  if (stringToBN(maxTokenValue).eq(ZERO_BN)) {
    return `You don't have ${ticker} to borrow`
  }

  if (isInvalidAmount) {
    return 'Enter an amount'
  }

  if (isInsufficientBalance) {
    return ticker ? `Insufficient ${ticker}` : ''
  }

  return ''
}

export const calculateTotalAmountToGet = (offers: BorrowSplTokenOffers[]) => {
  return offers.reduce((acc, offer) => {
    return acc.add(new BN(offer.amountToGet, 'hex'))
  }, new BN(0))
}
