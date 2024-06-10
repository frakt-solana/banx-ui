import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { filter, groupBy, maxBy, uniqBy } from 'lodash'
import moment from 'moment'

import { core } from '@banx/api/tokens'

const LOANS_CACHE_TIME_UNIX = 2 * 60 //? Auto clear optimistic after 2 minutes

export interface TokenLoanOptimistic {
  loan: core.TokenLoan
  wallet: string
  expiredAt: number
}

export const isOptimisticLoanExpired = (loan: TokenLoanOptimistic, walletPublicKey: string) =>
  loan.expiredAt < moment().unix() && loan.wallet === walletPublicKey

export const addLoans = (loansState: TokenLoanOptimistic[], loansToAdd: TokenLoanOptimistic[]) => {
  const sameLoansRemoved = uniqBy([...loansState, ...loansToAdd], ({ loan }) => loan.publicKey)

  return purgeLoansWithSameMintByFreshness(sameLoansRemoved, ({ loan }) => loan)
}

export const removeLoans = (loansState: TokenLoanOptimistic[], loansPubkeysToRemove: string[]) =>
  loansState.filter(({ loan }) => !loansPubkeysToRemove.includes(loan.publicKey))

export const findLoan = (
  loansState: TokenLoanOptimistic[],
  loanPublicKey: string,
  walletPublicKey: string,
) =>
  loansState.find(
    ({ loan, wallet }) => loan.publicKey === loanPublicKey && wallet === walletPublicKey,
  )

export const updateLoans = (
  loansState: TokenLoanOptimistic[],
  loansToAddOrUpdate: TokenLoanOptimistic[],
) => {
  const publicKeys = loansToAddOrUpdate.map(({ loan }) => loan.publicKey)
  const sameLoansRemoved = removeLoans(loansState, publicKeys)
  return addLoans(sameLoansRemoved, loansToAddOrUpdate)
}

export const isLoanNewer = (loanA: core.TokenLoan, loanB: core.TokenLoan) =>
  loanA.fraktBond.lastTransactedAt >= loanB.fraktBond.lastTransactedAt

//? Remove loans with same mint by priority of lastTransactedAt
export const purgeLoansWithSameMintByFreshness = <L>(
  loans: L[],
  getLoan: (loan: L) => core.TokenLoan,
) => {
  const loansByMint = groupBy(loans, (loan) => getLoan(loan).collateral.mint)

  return Object.values(loansByMint)
    .map((loansWithSameMint) =>
      maxBy(loansWithSameMint, (loan) => getLoan(loan).fraktBond.lastTransactedAt),
    )
    .flat() as L[]
}

export const convertLoanToOptimistic = (loan: core.TokenLoan, walletPublicKey: string) => {
  return {
    loan,
    wallet: walletPublicKey,
    expiredAt: moment().unix() + LOANS_CACHE_TIME_UNIX,
  }
}

export const filterOptimisticLoansByTokenType = (
  loans: TokenLoanOptimistic[],
  tokenType: LendingTokenType,
) => {
  return filter(loans, ({ loan }) => loan.bondTradeTransaction.lendingToken === tokenType)
}
