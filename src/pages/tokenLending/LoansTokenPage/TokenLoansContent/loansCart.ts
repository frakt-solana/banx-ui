import produce from 'immer'
import { create } from 'zustand'

import { core } from '@banx/api/tokens'

export interface TokenLoanOptimistic {
  loan: core.TokenLoan
  wallet: string
}

const convertLoanToOptimistic = (loan: core.TokenLoan, walletPublicKey: string) => {
  return {
    loan,
    wallet: walletPublicKey,
  }
}

interface SelectedTokenLoansState {
  selection: TokenLoanOptimistic[]
  set: (selection: core.TokenLoan[], walletPublicKey: string) => void
  find: (loanPubkey: string, walletPublicKey: string) => TokenLoanOptimistic | null
  add: (loan: core.TokenLoan, walletPublicKey: string) => void
  remove: (loanPubkey: string, walletPublicKey: string) => void
  toggle: (loan: core.TokenLoan, walletPublicKey: string) => void
  clear: () => void
}

export const useSelectedTokenLoans = create<SelectedTokenLoansState>((set, get) => ({
  selection: [],
  set: (selection, walletPublicKey) => {
    if (!walletPublicKey) return

    return set(
      produce((state: SelectedTokenLoansState) => {
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
      produce((state: SelectedTokenLoansState) => {
        state.selection.push(convertLoanToOptimistic(loan, walletPublicKey))
      }),
    )
  },
  remove: (loanPubkey, walletPublicKey) => {
    if (!walletPublicKey) return

    set(
      produce((state: SelectedTokenLoansState) => {
        state.selection = state.selection.filter(({ loan }) => loan.publicKey !== loanPubkey)
      }),
    )
  },
  clear: () => {
    set(
      produce((state: SelectedTokenLoansState) => {
        state.selection = []
      }),
    )
  },
  toggle: (loan: core.TokenLoan, walletPublicKey) => {
    if (!walletPublicKey) return

    const { find, add, remove } = get()
    const isLoanInSelection = !!find(loan.publicKey, walletPublicKey)

    isLoanInSelection ? remove(loan.publicKey, walletPublicKey) : add(loan, walletPublicKey)
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
