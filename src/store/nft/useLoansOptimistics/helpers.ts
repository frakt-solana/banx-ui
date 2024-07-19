import { web3 } from 'fbonds-core'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { filter, groupBy, maxBy, uniqBy } from 'lodash'
import moment from 'moment'

import { coreNew } from '@banx/api/nft'
import { isBanxSolTokenType, isSolTokenType, isUsdcTokenType } from '@banx/utils'

const LOANS_CACHE_TIME_UNIX = 2 * 60 //? Auto clear optimistic after 2 minutes

export interface LoanOptimistic {
  loan: coreNew.Loan
  wallet: string
  expiredAt: number
}

export const isOptimisticLoanExpired = (loan: LoanOptimistic, walletPublicKey: string) =>
  loan.expiredAt < moment().unix() && loan.wallet === walletPublicKey

export const addLoans = (loansState: LoanOptimistic[], loansToAdd: LoanOptimistic[]) => {
  const sameLoansRemoved = uniqBy([...loansState, ...loansToAdd], ({ loan }) => loan.publicKey)

  return purgeLoansWithSameMintByFreshness(sameLoansRemoved, ({ loan }) => loan)
}

export const removeLoans = (loansState: LoanOptimistic[], loansPubkeysToRemove: web3.PublicKey[]) =>
  loansState.filter(
    ({ loan }) =>
      !loansPubkeysToRemove.map((p) => p.toBase58()).includes(loan.publicKey.toBase58()),
  )

export const findLoan = (
  loansState: LoanOptimistic[],
  loanPublicKey: web3.PublicKey,
  walletPublicKey: string,
) =>
  loansState.find(
    ({ loan, wallet }) => loan.publicKey.equals(loanPublicKey) && wallet === walletPublicKey,
  )

export const updateLoans = (loansState: LoanOptimistic[], loansToAddOrUpdate: LoanOptimistic[]) => {
  const publicKeys = loansToAddOrUpdate.map(({ loan }) => loan.publicKey)
  const sameLoansRemoved = removeLoans(loansState, publicKeys)
  return addLoans(sameLoansRemoved, loansToAddOrUpdate)
}

export const isLoanNewer = (loanA: coreNew.Loan, loanB: coreNew.Loan) =>
  loanA.fraktBond.lastTransactedAt.gte(loanB.fraktBond.lastTransactedAt)

//? Remove loans with same mint by priority of lastTransactedAt
export const purgeLoansWithSameMintByFreshness = <L>(
  loans: L[],
  getLoan: (loan: L) => coreNew.Loan,
): L[] => {
  const loansByMint = groupBy(loans, (loan) => getLoan(loan).nft.mint)

  return Object.values(loansByMint)
    .map((loansWithSameMint) =>
      maxBy(loansWithSameMint, (loan) => getLoan(loan).fraktBond.lastTransactedAt.toNumber()),
    )
    .flat() as L[]
}

export const convertLoanToOptimistic = (loan: coreNew.Loan, walletPublicKey: string) => {
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
  const isUsdc = (loan: coreNew.Loan) => isUsdcTokenType(loan.bondTradeTransaction.lendingToken)

  const isSolOrBanxSol = (loan: coreNew.Loan) =>
    isSolTokenType(loan.bondTradeTransaction.lendingToken) ||
    isBanxSolTokenType(loan.bondTradeTransaction.lendingToken)

  return filter(loans, ({ loan }) =>
    isUsdcTokenType(tokenType) ? isUsdc(loan) : isSolOrBanxSol(loan),
  )
}
