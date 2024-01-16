import { reduce } from 'lodash'

import { Loan } from '@banx/api/core'
import { calculateClaimValue } from '@banx/pages/OffersPage'
import { calcLoanBorrowedAmount } from '@banx/utils'

export const getTerminateStatsInfo = (loans: Loan[]) => {
  return reduce(
    loans,
    (acc, loan) => {
      const claimValue = calculateClaimValue(loan)
      const borrowedAmount = calcLoanBorrowedAmount(loan)

      return {
        totalLent: acc.totalLent + borrowedAmount,
        averageLtv: acc.averageLtv + (claimValue / loan.nft.collectionFloor) * 100,
        totalInterest: acc.totalInterest + claimValue - borrowedAmount,
      }
    },
    { totalLent: 0, averageLtv: 0, totalInterest: 0 },
  )
}
