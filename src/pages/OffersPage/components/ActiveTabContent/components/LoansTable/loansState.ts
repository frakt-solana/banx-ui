import produce from 'immer'
import { create } from 'zustand'

import { Loan } from '@banx/api/core'

export interface LoanOptimistic {
  loan: Loan
  wallet: string
}

const convertLoanToOptimistic = (loan: Loan, walletPublicKey: string) => {
  return {
    loan,
    wallet: walletPublicKey,
  }
}

interface SelectedLoansState {
  selection: LoanOptimistic[]
  set: (selection: Loan[], walletPublicKey: string) => void
  find: (loanPubkey: string, walletPublicKey: string) => LoanOptimistic | null
  add: (loan: Loan, walletPublicKey: string) => void
  remove: (loanPubkey: string, walletPublicKey: string) => void
  toggle: (loan: Loan, walletPublicKey: string) => void
  clear: () => void
}

export const useSelectedLoans = create<SelectedLoansState>((set, get) => ({
  selection: [],
  set: (selection, walletPublicKey) => {
    if (!walletPublicKey) return

    return set(
      produce((state: SelectedLoansState) => {
        state.selection = selection.map((loan) => convertLoanToOptimistic(loan, walletPublicKey))
      }),
    )
  },
  find: (loanPubkey, walletPublicKey) => {
    if (!walletPublicKey) return null

    return get().selection.find(({ loan }) => loan.publicKey === loanPubkey) ?? null
  },
  add: (loan, walletPublicKey) => {
    if (!walletPublicKey) return

    set(
      produce((state: SelectedLoansState) => {
        state.selection.push(convertLoanToOptimistic(loan, walletPublicKey))
      }),
    )
  },
  remove: (loanPubkey, walletPublicKey) => {
    if (!walletPublicKey) return

    set(
      produce((state: SelectedLoansState) => {
        state.selection = state.selection.filter(({ loan }) => loan.publicKey !== loanPubkey)
      }),
    )
  },
  clear: () => {
    set(
      produce((state: SelectedLoansState) => {
        state.selection = []
      }),
    )
  },
  toggle: (loan: Loan, walletPublicKey) => {
    if (!walletPublicKey) return

    const { find, add, remove } = get()
    const isLoanInSelection = !!find(loan.publicKey, walletPublicKey)

    isLoanInSelection ? remove(loan.publicKey, walletPublicKey) : add(loan, walletPublicKey)
  },
}))
