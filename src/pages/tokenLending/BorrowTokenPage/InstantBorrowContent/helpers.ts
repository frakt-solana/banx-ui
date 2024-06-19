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

  if (isInvalidAmount) {
    return 'Enter an amount'
  }

  if (isInsufficientBalance) {
    return ticker ? `Insufficient ${ticker}` : ''
  }

  return ''
}
