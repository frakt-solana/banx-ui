import { useEffect, useMemo } from 'react'

import { get, set } from 'idb-keyval'
import { map } from 'lodash'
import { create } from 'zustand'

import { TokenLoan } from '@banx/api/tokens'

import { useTokenType } from '../../common/useTokenType'
import {
  TokenLoanOptimistic,
  addLoans,
  convertLoanToOptimistic,
  filterOptimisticLoansByTokenType,
  findLoan,
  removeLoans,
  updateLoans,
} from './helpers'

const BANX_TOKEN_LOAN_LISTINGS_OPTIMISTICS_LS_KEY = '@banx.tokenLoanListingsOptimistics'

interface TokenLoanListingsOptimistic {
  optimisticLoans: TokenLoanOptimistic[]
  find: (publicKey: string, walletPublicKey: string) => TokenLoanOptimistic | undefined
  add: (loans: TokenLoan[], walletPublicKey: string) => void
  remove: (publicKeys: string[], walletPublicKey: string) => void
  update: (loans: TokenLoan[], walletPublicKey: string) => void
  setState: (optimisticLoans: TokenLoanOptimistic[]) => void
}

const useTokenLoanListingsOptimisticStore = create<TokenLoanListingsOptimistic>((set, get) => ({
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

  update: (loans: TokenLoan[], walletPublicKey) => {
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

export const useTokenLoanListingsOptimistic = () => {
  const {
    optimisticLoans: optimisticLoans,
    add,
    update,
    remove,
    find,
    setState,
  } = useTokenLoanListingsOptimisticStore()

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

const setOptimisticLoansIdb = async (loans: TokenLoanOptimistic[]) => {
  try {
    await set(BANX_TOKEN_LOAN_LISTINGS_OPTIMISTICS_LS_KEY, loans)
  } catch {
    return
  }
}

const getOptimisticLoansIdb = async () => {
  try {
    return ((await get(BANX_TOKEN_LOAN_LISTINGS_OPTIMISTICS_LS_KEY)) || []) as TokenLoanOptimistic[]
  } catch {
    return []
  }
}
