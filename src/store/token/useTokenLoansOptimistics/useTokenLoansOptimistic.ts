import { useEffect, useMemo } from 'react'

import { get, set } from 'idb-keyval'
import { map } from 'lodash'
import { create } from 'zustand'

import { core } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'

import {
  TokenLoanOptimistic,
  addLoans,
  convertLoanToOptimistic,
  filterOptimisticLoansByTokenType,
  findLoan,
  removeLoans,
  updateLoans,
} from './helpers'

const BANX_TOKEN_LOANS_OPTIMISTICS_LS_KEY = '@banx.tokenLoansOptimistics'

export interface TokenLoansOptimisticStore {
  optimisticLoans: TokenLoanOptimistic[]
  find: (publicKey: string, walletPublicKey: string) => TokenLoanOptimistic | undefined
  add: (loans: core.TokenLoan[], walletPublicKey: string) => void
  remove: (publicKeys: string[], walletPublicKey: string) => void
  update: (loans: core.TokenLoan[], walletPublicKey: string) => void
  setState: (optimisticLoans: TokenLoanOptimistic[]) => void
}

const useOptimisticLoansStore = create<TokenLoansOptimisticStore>((set, get) => ({
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

  update: (loans: core.TokenLoan[], walletPublicKey) => {
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

export const useTokenLoansOptimistic = () => {
  const {
    optimisticLoans: optimisticLoans,
    add,
    update,
    remove,
    find,
    setState,
  } = useOptimisticLoansStore()

  const { tokenType } = useNftTokenType()

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

const setOptimisticLoansIdb = async (loans: TokenLoanOptimistic[]) => {
  try {
    await set(BANX_TOKEN_LOANS_OPTIMISTICS_LS_KEY, loans)
  } catch {
    return
  }
}

const getOptimisticLoansIdb = async () => {
  try {
    return ((await get(BANX_TOKEN_LOANS_OPTIMISTICS_LS_KEY)) || []) as TokenLoanOptimistic[]
  } catch {
    return []
  }
}
