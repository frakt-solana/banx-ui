import produce from 'immer'
import { uniqBy } from 'lodash'
import { create } from 'zustand'

import { Loan } from '@banx/api/core'

export interface LoansOptimisticStore {
  loans: Loan[]
  find: (publicKey: string) => Loan | undefined
  add: (...loans: Loan[]) => void
  remove: (...publicKeys: string[]) => void
  update: (...loans: Loan[]) => void
}

export const useOptimisticLoans = create<LoansOptimisticStore>((set, get) => ({
  loans: [],
  find: (publicKey) => {
    return get().loans.find((l) => l.publicKey === publicKey)
  },
  add: (...loans) => {
    set(
      produce((state: LoansOptimisticStore) => {
        state.loans = uniqBy([...state.loans, ...loans], ({ publicKey }) => publicKey)
      }),
    )
  },
  remove: (...publicKeys) => {
    set(
      produce((state: LoansOptimisticStore) => {
        state.loans.filter(({ publicKey }) => !publicKeys.includes(publicKey))
      }),
    )
  },
  update: (...loans) => {
    const { add, remove } = get()
    const publicKeys = loans.map(({ publicKey }) => publicKey)
    remove(...publicKeys)
    add(...loans)
  },
}))
