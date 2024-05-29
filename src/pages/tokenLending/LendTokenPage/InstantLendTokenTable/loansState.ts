import produce from 'immer'
import { create } from 'zustand'

import { core } from '@banx/api/tokens'

type LoansState = {
  selection: core.TokenLoan[]
  set: (loans: core.TokenLoan[]) => void
  find: (loanPubkey: string) => core.TokenLoan | null
  add: (nft: core.TokenLoan) => void
  remove: (loanPubkey: string) => void
  toggle: (loan: core.TokenLoan) => void
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
