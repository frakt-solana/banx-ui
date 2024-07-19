import produce from 'immer'
import { create } from 'zustand'

import { coreNew } from '@banx/api/nft'

type LoansState = {
  selection: coreNew.Loan[]
  set: (loans: coreNew.Loan[]) => void
  find: (loanPubkey: string) => coreNew.Loan | null
  add: (nft: coreNew.Loan) => void
  remove: (loanPubkey: string) => void
  toggle: (loan: coreNew.Loan) => void
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
    return get().selection.find(({ publicKey }) => publicKey.toBase58() === loanPubkey) ?? null
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
        state.selection = state.selection.filter(
          ({ publicKey }) => publicKey.toBase58() !== loanPubkey,
        )
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
    const isLoanInSelection = !!find(loan.publicKey.toBase58())

    isLoanInSelection ? remove(loan.publicKey.toBase58()) : add(loan)
  },
}))
