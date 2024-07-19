import produce from 'immer'
import { create } from 'zustand'

import { coreNew } from '@banx/api/nft'

export interface LoanOptimistic {
  loan: coreNew.Loan
  wallet: string
}

const convertLoanToOptimistic = (loan: coreNew.Loan, walletPublicKey: string) => {
  return {
    loan,
    wallet: walletPublicKey,
  }
}

interface SelectedLoansState {
  selection: LoanOptimistic[]
  set: (selection: coreNew.Loan[], walletPublicKey: string) => void
  find: (loanPubkey: string, walletPublicKey: string) => LoanOptimistic | null
  add: (loan: coreNew.Loan, walletPublicKey: string) => void
  remove: (loanPubkey: string, walletPublicKey: string) => void
  toggle: (loan: coreNew.Loan, walletPublicKey: string) => void
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

    return get().selection.find(({ loan }) => loan.publicKey.toBase58() === loanPubkey) ?? null
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
        state.selection = state.selection.filter(
          ({ loan }) => loan.publicKey.toBase58() !== loanPubkey,
        )
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
  toggle: (loan: coreNew.Loan, walletPublicKey) => {
    if (!walletPublicKey) return

    const { find, add, remove } = get()
    const isLoanInSelection = !!find(loan.publicKey.toBase58(), walletPublicKey)

    isLoanInSelection
      ? remove(loan.publicKey.toBase58(), walletPublicKey)
      : add(loan, walletPublicKey)
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
