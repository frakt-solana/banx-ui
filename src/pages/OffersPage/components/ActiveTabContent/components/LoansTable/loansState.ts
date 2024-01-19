import produce from 'immer'
import { create } from 'zustand'

import { Loan } from '@banx/api/core'

interface SelectedLoansState {
  selection: Loan[]
  set: (selection: Loan[]) => void
  find: (loanPubkey: string) => Loan | null
  add: (loan: Loan) => void
  remove: (loanPubkey: string) => void
  toggle: (loan: Loan) => void
  clear: () => void
}

export const useSelectedLoans = create<SelectedLoansState>((set, get) => ({
  selection: [],
  set: (selection) => {
    return set(
      produce((state: SelectedLoansState) => {
        state.selection = selection
      }),
    )
  },
  find: (loanPubkey) => {
    return get().selection.find((loan) => loan.publicKey === loanPubkey) ?? null
  },
  add: (loan) => {
    set(
      produce((state: SelectedLoansState) => {
        state.selection.push(loan)
      }),
    )
  },
  remove: (loanPubkey) => {
    set(
      produce((state: SelectedLoansState) => {
        state.selection = state.selection.filter((loan) => loan.publicKey !== loanPubkey)
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
  toggle: (loan: Loan) => {
    const { find, add, remove } = get()
    const isLoanInSelection = !!find(loan.publicKey)

    isLoanInSelection ? remove(loan.publicKey) : add(loan)
  },
}))
