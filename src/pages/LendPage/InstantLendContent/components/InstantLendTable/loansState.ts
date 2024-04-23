import { create } from 'zustand'

import { Loan } from '@banx/api/core'

type LoansState = {
  selectedLoans: Loan[]
  findSelectedLoan: (loanPubkey: string) => Loan | undefined
  onSelectLoan: (loan: Loan) => void
  onSelectLoans: (loans: Loan[]) => void
  onDeselectAllLoans: () => void
  deselectLoan: (loanPubkey: string) => void
}

export const useLoansState = create<LoansState>((set, get) => ({
  selectedLoans: [],
  findSelectedLoan: (loanPubkey) =>
    get().selectedLoans.find(({ publicKey }) => publicKey === loanPubkey),
  onSelectLoan: (loan) =>
    set((state) => {
      const isLoanInCart = !!state.findSelectedLoan(loan.publicKey)
      if (isLoanInCart) {
        return {
          selectedLoans: state.selectedLoans.filter(
            ({ publicKey }) => publicKey !== loan.publicKey,
          ),
        }
      }
      return { selectedLoans: [...state.selectedLoans, loan] }
    }),
  onSelectLoans: (loans) => set({ selectedLoans: [...loans] }),
  onDeselectAllLoans: () => set({ selectedLoans: [] }),
  deselectLoan: (loanPubkey) =>
    set((state) => ({
      selectedLoans: state.selectedLoans.filter(({ publicKey }) => publicKey !== loanPubkey),
    })),
}))
