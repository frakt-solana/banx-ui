import { sumBy } from 'lodash'

import { Loan } from '@banx/api/core'

export const getAdditionalOfferInfo = (loans: Loan[]) => {
  const totalLent = sumBy(loans, calculateLentValue)
  //TODO: replace borrowedAmount to totalRepaidAmount
  const totalRepaid = sumBy(loans, 'borrowedAmount')

  return {
    lent: totalLent,
    repaid: totalRepaid,
    claim: 0,
    apy: 0,
    interest: 0,
  }
}

const calculateLentValue = (loan: Loan) => {
  const { bondTradeTransaction, totalRepaidAmount = 0 } = loan
  const { solAmount = 0, feeAmount = 0 } = bondTradeTransaction

  return solAmount + feeAmount + totalRepaidAmount
}
