import { useEffect, useMemo } from 'react'

import { get, set } from 'idb-keyval'
import { map } from 'lodash'
import { create } from 'zustand'

import { core } from '@banx/api/nft'

import { useTokenType } from '../../common/useTokenType'
import {
  LoanOptimistic,
  addLoans,
  convertLoanToOptimistic,
  filterOptimisticLoansByTokenType,
  findLoan,
  removeLoans,
  updateLoans,
} from './helpers'

const BANX_LOANS_OPTIMISTICS_LS_KEY = '@banx.loansOptimistics'

export interface LoansOptimisticStore {
  optimisticLoans: LoanOptimistic[]
  find: (publicKey: string, walletPublicKey: string) => LoanOptimistic | undefined
  add: (loans: core.Loan[], walletPublicKey: string) => void
  remove: (publicKeys: string[], walletPublicKey: string) => void
  update: (loans: core.Loan[], walletPublicKey: string) => void
  setState: (optimisticLoans: LoanOptimistic[]) => void
}

const useOptimisticLoansStore = create<LoansOptimisticStore>((set, get) => ({
  optimisticLoans: [],
  add: (loans, walletPublicKey) => {
    if (!walletPublicKey) return
    return set((state) => {
      const nextLoans = addLoans(
        state.optimisticLoans,
        map(loans, (loan) => convertLoanToOptimistic(loan, walletPublicKey)),
      )
      setOptimisticLoansIdb(nextLoans)
      return { ...state, optimisticLoans: nextLoans }
    })
  },
  remove: (publicKeys) =>
    set((state) => {
      const nextLoans = removeLoans(state.optimisticLoans, publicKeys)
      setOptimisticLoansIdb(nextLoans)
      return { ...state, optimisticLoans: nextLoans }
    }),

  find: (publicKey, walletPublicKey) => {
    if (!walletPublicKey) return undefined
    const { optimisticLoans } = get()
    return findLoan(optimisticLoans, publicKey, walletPublicKey)
  },

  update: (loans: core.Loan[], walletPublicKey) => {
    if (!walletPublicKey) return
    set((state) => {
      const nextLoans = updateLoans(
        state.optimisticLoans,
        map(loans, (loan) => convertLoanToOptimistic(loan, walletPublicKey)),
      )
      setOptimisticLoansIdb(nextLoans)
      return { ...state, optimisticLoans: nextLoans }
    })
  },
  setState: (optimisticLoans) =>
    set((state) => {
      return { ...state, optimisticLoans }
    }),
}))

export const useLoansOptimistic = () => {
  const {
    optimisticLoans: optimisticLoans,
    add,
    update,
    remove,
    find,
    setState,
  } = useOptimisticLoansStore()

  const { tokenType } = useTokenType()

  useEffect(() => {
    const setInitialState = async () => {
      try {
        const optimisticLoans = await getOptimisticLoansIdb()
        await setOptimisticLoansIdb(optimisticLoans)
        setState(optimisticLoans)
      } catch (error) {
        console.error(error)
        await setOptimisticLoansIdb([])
        setState([])
      }
    }
    setInitialState()
  }, [setState])

  const filteredLoansByTokenType = useMemo(() => {
    return filterOptimisticLoansByTokenType(optimisticLoans, tokenType)
  }, [optimisticLoans, tokenType])

  return { loans: filteredLoansByTokenType, add, remove, find, update }
}

const setOptimisticLoansIdb = async (loans: LoanOptimistic[]) => {
  try {
    await set(BANX_LOANS_OPTIMISTICS_LS_KEY, loans)
  } catch {
    return
  }
}

const getOptimisticLoansIdb = async () => {
  try {
    return ((await get(BANX_LOANS_OPTIMISTICS_LS_KEY)) || []) as LoanOptimistic[]
  } catch {
    return []
  }
}
