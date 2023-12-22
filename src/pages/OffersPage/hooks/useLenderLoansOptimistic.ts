import { produce } from 'immer'
import { create } from 'zustand'

import { Loan } from '@banx/api/core'

export interface LoanOptimistic {
  loan: Loan
  wallet: string
}

interface OptimisticLenderLoansState {
  loans: LoanOptimistic[]
  addLoans: (loan: Loan, walletPublicKey: string) => void
  findLoan: (loanPubkey: string, walletPublicKey: string) => LoanOptimistic | null
  updateLoans: (loan: Loan, walletPublicKey: string) => void
}

export const useLenderLoansOptimistic = create<OptimisticLenderLoansState>((set, get) => ({
  loans: [],
  addLoans: (loan, walletPublicKey) => {
    if (!walletPublicKey) return

    return set(
      produce((state: OptimisticLenderLoansState) => {
        state.loans.push(convertLoanToOptimistic(loan, walletPublicKey))
      }),
    )
  },
  findLoan: (loanPubkey, walletPublicKey) => {
    if (!walletPublicKey) return null

    return get().loans.find(({ loan }) => loan.publicKey === loanPubkey) ?? null
  },
  updateLoans: (loan, walletPublicKey) => {
    if (!walletPublicKey) return

    const loanExists = !!get().findLoan(loan.publicKey, walletPublicKey)

    loanExists &&
      set(
        produce((state: OptimisticLenderLoansState) => {
          state.loans = state.loans.map((existingLoan) =>
            existingLoan.loan.publicKey === loan.publicKey
              ? convertLoanToOptimistic(loan, walletPublicKey)
              : existingLoan,
          )
        }),
      )
  },
}))

const convertLoanToOptimistic = (loan: Loan, walletPublicKey: string) => {
  return {
    loan,
    wallet: walletPublicKey,
  }
}
