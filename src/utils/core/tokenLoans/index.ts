import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'

import { core } from '@banx/api/tokens'

export const isTokenLoanFrozen = (loan: core.TokenLoan) => {
  return !!loan.bondTradeTransaction.terminationFreeze
}

export const isTokenLoanListed = (loan: core.TokenLoan) => {
  return (
    loan.bondTradeTransaction.bondTradeTransactionState ===
    BondTradeTransactionV2State.PerpetualBorrowerListing
  )
}
