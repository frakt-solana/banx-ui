import produce from 'immer'
import { create } from 'zustand'

import { Loan } from '@banx/api/core'

type LoansState = {
  selection: Loan[]
  set: (loans: Loan[]) => void
  find: (loanPubkey: string) => Loan | null
  add: (nft: Loan) => void
  remove: (loanPubkey: string) => void
  toggle: (loan: Loan) => void
  clear: () => void
}

export const useLoansState = create<LoansState>((set, get) => ({
  selection: [],

  set: (loans) => {
    return set(
      produce((state: LoansState) => {
        state.selection = loans.map((loan) => loan)
      }),
    )
  },

  find: (loanPubkey) => {
    return get().selection.find(({ publicKey }) => publicKey === loanPubkey) ?? null
  },

  add: (loan) => {
    return set(
      produce((state: LoansState) => {
        state.selection.push(loan)
      }),
    )
  },

  remove: (loanPubkey) => {
    return set(
      produce((state: LoansState) => {
        state.selection = state.selection.filter(({ publicKey }) => publicKey !== loanPubkey)
      }),
    )
  },

  clear: () => {
    set(
      produce((state: LoansState) => {
        state.selection = []
      }),
    )
  },

  toggle: (loan) => {
    const { find, add, remove } = get()
    const isLoanInSelection = !!find(loan.publicKey)

    isLoanInSelection ? remove(loan.publicKey) : add(loan)
  },
}))
