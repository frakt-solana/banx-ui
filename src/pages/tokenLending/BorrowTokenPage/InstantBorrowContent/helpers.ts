import { ZERO_BN, stringToBN } from '@banx/utils'

import { BorrowToken } from '../constants'

interface GetErrorMessageProps {
  collateral: BorrowToken | undefined
  collaretalInputValue: string
  maxTokenValue: string
  offersExist: boolean
}

export const getErrorMessage = ({
  collateral,
  collaretalInputValue,
  maxTokenValue,
  offersExist,
}: GetErrorMessageProps) => {
  const { ticker = '' } = collateral?.meta || {}

  const isInvalidAmount = stringToBN(collaretalInputValue).lte(ZERO_BN)
  const isInsufficientBalance = stringToBN(collaretalInputValue).gt(stringToBN(maxTokenValue))

  if (!offersExist) {
    return 'No offers found'
  }

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
