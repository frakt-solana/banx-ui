import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { filter, groupBy, maxBy, uniqBy } from 'lodash'
import moment from 'moment'

import { core } from '@banx/api/nft'
import { isBanxSolTokenType, isSolTokenType, isUsdcTokenType } from '@banx/utils'

const LOANS_CACHE_TIME_UNIX = 2 * 60 //? Auto clear optimistic after 2 minutes

export interface LoanOptimistic {
  loan: core.Loan
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

export const isLoanNewer = (loanA: core.Loan, loanB: core.Loan) =>
  loanA.fraktBond.lastTransactedAt >= loanB.fraktBond.lastTransactedAt

//? Remove loans with same mint by priority of lastTransactedAt
export const purgeLoansWithSameMintByFreshness = <L>(
  loans: L[],
  getLoan: (loan: L) => core.Loan,
) => {
  const loansByMint = groupBy(loans, (loan) => getLoan(loan).nft.mint)

  return Object.values(loansByMint)
    .map((loansWithSameMint) =>
      maxBy(loansWithSameMint, (loan) => getLoan(loan).fraktBond.lastTransactedAt),
    )
    .flat() as L[]
}

export const convertLoanToOptimistic = (loan: core.Loan, walletPublicKey: string) => {
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
  const isUsdc = (loan: core.Loan) => isUsdcTokenType(loan.bondTradeTransaction.lendingToken)

  const isSolOrBanxSol = (loan: core.Loan) =>
    isSolTokenType(loan.bondTradeTransaction.lendingToken) ||
    isBanxSolTokenType(loan.bondTradeTransaction.lendingToken)

  return filter(loans, ({ loan }) =>
    isUsdcTokenType(tokenType) ? isUsdc(loan) : isSolOrBanxSol(loan),
  )
}
