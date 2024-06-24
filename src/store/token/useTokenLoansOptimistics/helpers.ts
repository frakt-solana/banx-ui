import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { filter, uniqBy } from 'lodash'
import moment from 'moment'

import { core } from '@banx/api/tokens'
import { isBanxSolTokenType, isSolTokenType, isUsdcTokenType } from '@banx/utils'

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
  return sameLoansRemoved
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
  const isUsdc = (loan: core.TokenLoan) => isUsdcTokenType(loan.bondTradeTransaction.lendingToken)

  const isSolOrBanxSol = (loan: core.TokenLoan) =>
    isSolTokenType(loan.bondTradeTransaction.lendingToken) ||
    isBanxSolTokenType(loan.bondTradeTransaction.lendingToken)

  return filter(loans, ({ loan }) =>
    isUsdcTokenType(tokenType) ? isUsdc(loan) : isSolOrBanxSol(loan),
  )
}
