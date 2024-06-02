import produce from 'immer'
import { create } from 'zustand'

import { core } from '@banx/api/tokens'

type LoansTokenState = {
  selection: core.TokenLoan[]
  set: (loans: core.TokenLoan[]) => void
  find: (loanPubkey: string) => core.TokenLoan | null
  add: (nft: core.TokenLoan) => void
  remove: (loanPubkey: string) => void
  toggle: (loan: core.TokenLoan) => void
  clear: () => void
}

export const useLoansTokenState = create<LoansTokenState>((set, get) => ({
  selection: [],

  set: (loans) => {
    return set(
      produce((state: LoansTokenState) => {
        state.selection = loans.map((loan) => loan)
      }),
    )
  },

  find: (loanPubkey) => {
    return get().selection.find(({ publicKey }) => publicKey === loanPubkey) ?? null
  },

  add: (loan) => {
    return set(
      produce((state: LoansTokenState) => {
        state.selection.push(loan)
      }),
    )
  },

  remove: (loanPubkey) => {
    return set(
      produce((state: LoansTokenState) => {
        state.selection = state.selection.filter(({ publicKey }) => publicKey !== loanPubkey)
      }),
    )
  },

  clear: () => {
    set(
      produce((state: LoansTokenState) => {
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
