import { BN } from 'fbonds-core'

import { BorrowSplTokenOffers, CollateralToken } from '@banx/api/tokens'
import { ZERO_BN, stringToBN } from '@banx/utils'

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
    return ticker ? `Insufficient ${ticker}` : ''
  }

  if (noOffersAvailable) {
    return 'No offers found'
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
