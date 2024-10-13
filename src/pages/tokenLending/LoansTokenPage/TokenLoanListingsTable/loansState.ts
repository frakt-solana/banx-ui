import produce from 'immer'
import { create } from 'zustand'

import { TokenLoan } from '@banx/api/tokens'

export interface LoanOptimistic {
  loan: TokenLoan
  wallet: string
}

const convertLoanToOptimistic = (loan: TokenLoan, walletPublicKey: string) => {
  return {
    loan,
    wallet: walletPublicKey,
  }
}

interface SelectTokenLoansState {
  selection: LoanOptimistic[]
  set: (selection: TokenLoan[], walletPublicKey: string) => void
  find: (loanPubkey: string, walletPublicKey: string) => LoanOptimistic | null
  add: (loan: TokenLoan, walletPublicKey: string) => void
  remove: (loanPubkey: string, walletPublicKey: string) => void
  toggle: (loan: TokenLoan, walletPublicKey: string) => void
  clear: () => void
}

export const useSelectTokenLoans = create<SelectTokenLoansState>((set, get) => ({
  selection: [],
  set: (selection, walletPublicKey) => {
    if (!walletPublicKey) return

    return set(
      produce((state: SelectTokenLoansState) => {
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
      produce((state: SelectTokenLoansState) => {
        state.selection.push(convertLoanToOptimistic(loan, walletPublicKey))
      }),
    )
  },
  remove: (loanPubkey, walletPublicKey) => {
    if (!walletPublicKey) return

    set(
      produce((state: SelectTokenLoansState) => {
        state.selection = state.selection.filter(({ loan }) => loan.publicKey !== loanPubkey)
      }),
    )
  },
  clear: () => {
    set(
      produce((state: SelectTokenLoansState) => {
        state.selection = []
      }),
    )
  },
  toggle: (loan: TokenLoan, walletPublicKey) => {
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
