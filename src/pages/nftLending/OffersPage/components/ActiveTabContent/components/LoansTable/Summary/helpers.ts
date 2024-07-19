import { reduce } from 'lodash'

import { coreNew } from '@banx/api/nft'
import { calculateBorrowedAmount, calculateClaimValue } from '@banx/utils'

export const getTerminateStatsInfo = (loans: coreNew.Loan[]) => {
  return reduce(
    loans,
    (acc, loan) => {
      const claimValue = calculateClaimValue(loan)
      const borrowedAmount = calculateBorrowedAmount(loan).toNumber()
      const collectionFloor = loan.nft.collectionFloor

      return {
        totalLent: acc.totalLent + borrowedAmount,
        averageLtv: acc.averageLtv + (claimValue / collectionFloor.toNumber() / loans.length) * 100,
        totalInterest: acc.totalInterest + claimValue - borrowedAmount,
      }
    },
    { totalLent: 0, averageLtv: 0, totalInterest: 0 },
  )
}
