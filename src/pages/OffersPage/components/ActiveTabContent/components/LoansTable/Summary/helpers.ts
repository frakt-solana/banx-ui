import { reduce } from 'lodash'

import { core } from '@banx/api/nft'
import { calculateClaimValue } from '@banx/pages/OffersPage'
import { calcLoanBorrowedAmount } from '@banx/utils'

export const getTerminateStatsInfo = (loans: core.Loan[]) => {
  return reduce(
    loans,
    (acc, loan) => {
      const claimValue = calculateClaimValue(loan)
      const borrowedAmount = calcLoanBorrowedAmount(loan)
      const collectionFloor = loan.nft.collectionFloor

      return {
        totalLent: acc.totalLent + borrowedAmount,
        averageLtv: acc.averageLtv + (claimValue / collectionFloor / loans.length) * 100,
        totalInterest: acc.totalInterest + claimValue - borrowedAmount,
      }
    },
    { totalLent: 0, averageLtv: 0, totalInterest: 0 },
  )
}
