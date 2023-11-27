import { SyntheticOffer } from '@banx/store'

import { shouldShowDepositError } from '../helpers'

type GetCreateOfferErrorMessage = (props: {
  syntheticOffer: SyntheticOffer
  solanaBalance: number
  offerSize: number
}) => string

const ERROR_MESSAGES = {
  balanceError: 'Insufficient balance. Please deposit more SOL.',
  offerError: 'Invalid offer. The offer size is too high.',
}

export const getOfferErrorMessage: GetCreateOfferErrorMessage = ({
  syntheticOffer,
  solanaBalance,
  offerSize,
}) => {
  const { loanValue, loansAmount, deltaValue } = syntheticOffer

  const showBalanceError = shouldShowDepositError({
    initialLoansAmount: loansAmount,
    initialLoanValue: loanValue,
    solanaBalance,
    offerSize,
  })

  const showOfferError = deltaValue * loansAmount > loanValue

  return (
    (showBalanceError && ERROR_MESSAGES.balanceError) ||
    (showOfferError && ERROR_MESSAGES.offerError) ||
    ''
  )
}
