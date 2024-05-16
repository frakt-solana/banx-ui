import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { filter, groupBy, maxBy, uniqBy } from 'lodash'
import moment from 'moment'

import { Loan } from '@banx/api/core'

const LOANS_CACHE_TIME_UNIX = 1 //? Auto clear optimistic after 1 second

export interface LoanOptimistic {
  loan: Loan
  wallet: string
  expiredAt: number
}

export const isOptimisticLoanExpired = (loan: LoanOptimistic, walletPublicKey: string) =>
  loan.expiredAt < moment().unix() && loan.wallet === walletPublicKey

export const addLoans = (loansState: LoanOptimistic[], loansToAdd: LoanOptimistic[]) => {
  const sameLoansRemoved = uniqBy([...loansState, ...loansToAdd], ({ loan }) => loan.publicKey)

  return purgeLoansWithSameMintByFreshness(sameLoansRemoved, ({ loan }) => loan)
}

export const removeLoans = (loansState: LoanOptimistic[], loansPubkeysToRemove: string[]) =>
  loansState.filter(({ loan }) => !loansPubkeysToRemove.includes(loan.publicKey))

export const findLoan = (
  loansState: LoanOptimistic[],
  loanPublicKey: string,
  walletPublicKey: string,
) =>
  loansState.find(
    ({ loan, wallet }) => loan.publicKey === loanPublicKey && wallet === walletPublicKey,
  )

export const updateLoans = (loansState: LoanOptimistic[], loansToAddOrUpdate: LoanOptimistic[]) => {
  const publicKeys = loansToAddOrUpdate.map(({ loan }) => loan.publicKey)
  const sameLoansRemoved = removeLoans(loansState, publicKeys)
  return addLoans(sameLoansRemoved, loansToAddOrUpdate)
}

export const isLoanNewer = (loanA: Loan, loanB: Loan) =>
  loanA.fraktBond.lastTransactedAt >= loanB.fraktBond.lastTransactedAt

//? Remove loans with same mint by priority of lastTransactedAt
export const purgeLoansWithSameMintByFreshness = <L>(loans: L[], getLoan: (loan: L) => Loan) => {
  const loansByMint = groupBy(loans, (loan) => getLoan(loan).nft.mint)

  return Object.values(loansByMint)
    .map((loansWithSameMint) =>
      maxBy(loansWithSameMint, (loan) => getLoan(loan).fraktBond.lastTransactedAt),
    )
    .flat() as L[]
}

export const convertLoanToOptimistic = (loan: Loan, walletPublicKey: string) => {
  return {
    loan,
    wallet: walletPublicKey,
    expiredAt: moment().unix() + LOANS_CACHE_TIME_UNIX,
  }
}

export const filterOptimisticLoansByTokenType = (
  loans: LoanOptimistic[],
  tokenType: LendingTokenType,
) => {
  return filter(loans, ({ loan }) => loan.bondTradeTransaction.lendingToken === tokenType)
}
