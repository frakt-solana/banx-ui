import produce from 'immer'
import { create } from 'zustand'

import { Loan } from '@banx/api/core'

interface SelectedLoansState {
  selection: Loan[]
  setSelection: (selection: Loan[]) => void
  findLoanInSelection: (loanPubkey: string) => Loan | null
  addLoanToSelection: (loan: Loan) => void
  removeLoanFromSelection: (loanPubkey: string) => void
  toggleLoanInSelection: (loan: Loan) => void
  clearSelection: () => void
}

export const useSelectedLoans = create<SelectedLoansState>((set, get) => ({
  selection: [],
  setSelection: (selection) => {
    set(
      produce((state: SelectedLoansState) => {
        state.selection = selection
      }),
    )
  },
  findLoanInSelection: (loanPubkey) => {
    const { selection } = get()
    return selection.find(({ publicKey }) => publicKey === loanPubkey) ?? null
  },
  addLoanToSelection: (loan) => {
    set(
      produce((state: SelectedLoansState) => {
        state.selection.push(loan)
      }),
    )
  },
  removeLoanFromSelection: (loanPubkey) => {
    set(
      produce((state: SelectedLoansState) => {
        state.selection = state.selection.filter(({ publicKey }) => publicKey !== loanPubkey)
      }),
    )
  },
  clearSelection: () => {
    set(
      produce((state: SelectedLoansState) => {
        state.selection = []
      }),
    )
  },
  toggleLoanInSelection: (loan: Loan) => {
    const { findLoanInSelection, addLoanToSelection, removeLoanFromSelection } = get()
    const isLoanInSelection = !!findLoanInSelection(loan.publicKey)
    isLoanInSelection ? removeLoanFromSelection(loan.publicKey) : addLoanToSelection(loan)
  },
}))

interface HiddenLoansPubkeysState {
  hiddenLoansPubkeys: string[]
  addHiddenLoansPubkeys: (...pubkeys: string[]) => void
}

export const useHiddenLoansPubkeys = create<HiddenLoansPubkeysState>((set) => ({
  hiddenLoansPubkeys: [],
  addHiddenLoansPubkeys: (...pubkeys) => {
    set(
      produce((state: HiddenLoansPubkeysState) => {
        state.hiddenLoansPubkeys.push(...pubkeys)
      }),
    )
  },
}))
