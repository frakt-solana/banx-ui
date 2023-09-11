import { useEffect } from 'react'

import { groupBy, map, maxBy, uniqBy } from 'lodash'
import moment from 'moment'
import { create } from 'zustand'

import { Loan } from '@banx/api/core'

const BANX_LOANS_OPTIMISTICS_LS_KEY = '@banx.loansOptimistics'
const LOANS_CACHE_TIME_UNIX = 15 * 60 //? 15 minutes

export interface LoanOptimistic {
  loan: Loan
  wallet: string
  expiredAt: number
}

export interface LoansOptimisticStore {
  optimisticLoans: LoanOptimistic[]
  find: (publicKey: string, walletPublicKey: string) => LoanOptimistic | undefined
  add: (loans: Loan[], walletPublicKey: string) => void
  remove: (publicKeys: string[], walletPublicKey: string) => void
  update: (loans: Loan[], walletPublicKey: string) => void
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
      setOptimisticLoansLS(nextLoans)
      return { ...state, optimisticLoans: nextLoans }
    })
  },
  remove: (publicKeys) =>
    set((state) => {
      const nextLoans = removeLoans(state.optimisticLoans, publicKeys)
      setOptimisticLoansLS(nextLoans)
      return { ...state, optimisticLoans: nextLoans }
    }),

  find: (publicKey, walletPublicKey) => {
    if (!walletPublicKey) return undefined
    const { optimisticLoans } = get()
    return findLoan(optimisticLoans, publicKey, walletPublicKey)
  },

  update: (loans: Loan[], walletPublicKey) => {
    if (!walletPublicKey) return
    set((state) => {
      const nextLoans = updateLoans(
        state.optimisticLoans,
        map(loans, (loan) => convertLoanToOptimistic(loan, walletPublicKey)),
      )
      setOptimisticLoansLS(nextLoans)
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

  useEffect(() => {
    try {
      const optimisticLoans = getOptimisticLoansLS()
      setOptimisticLoansLS(optimisticLoans)
      setState(optimisticLoans)
    } catch (error) {
      console.error(error)
      setOptimisticLoansLS([])
      setState([])
    }
  }, [setState])

  return { loans: optimisticLoans, add, remove, find, update }
}

export const isOptimisticLoanExpired = (loan: LoanOptimistic, walletPublicKey: string) =>
  loan.expiredAt < moment().unix() && loan.wallet === walletPublicKey

const setOptimisticLoansLS = (loans: LoanOptimistic[]) => {
  localStorage.setItem(BANX_LOANS_OPTIMISTICS_LS_KEY, JSON.stringify(loans))
}

const convertLoanToOptimistic = (loan: Loan, walletPublicKey: string) => {
  return {
    loan,
    wallet: walletPublicKey,
    expiredAt: moment().unix() + LOANS_CACHE_TIME_UNIX,
  }
}

const getOptimisticLoansLS = () => {
  const optimisticLoans = localStorage.getItem(BANX_LOANS_OPTIMISTICS_LS_KEY)
  return (optimisticLoans ? JSON.parse(optimisticLoans) : []) as LoanOptimistic[]
}

const addLoans = (loansState: LoanOptimistic[], loansToAdd: LoanOptimistic[]) => {
  const sameLoansRemoved = uniqBy([...loansState, ...loansToAdd], ({ loan }) => loan.publicKey)

  return purgeLoansWithSameMintByFreshness(sameLoansRemoved, ({ loan }) => loan)
}

const removeLoans = (loansState: LoanOptimistic[], loansPubkeysToRemove: string[]) =>
  loansState.filter(({ loan }) => !loansPubkeysToRemove.includes(loan.publicKey))

const findLoan = (loansState: LoanOptimistic[], loanPublicKey: string, walletPublicKey: string) =>
  loansState.find(
    ({ loan, wallet }) => loan.publicKey === loanPublicKey && wallet === walletPublicKey,
  )

const updateLoans = (loansState: LoanOptimistic[], loansToAddOrUpdate: LoanOptimistic[]) => {
  const publicKeys = loansToAddOrUpdate.map(({ loan }) => loan.publicKey)
  const sameLoansRemoved = removeLoans(loansState, publicKeys)
  return addLoans(sameLoansRemoved, loansToAddOrUpdate)
}

export const isLoanNewer = (loanA: Loan, loanB: Loan) =>
  loanA.fraktBond.lastTransactedAt >= loanB.fraktBond.lastTransactedAt

//? Remove loans with same mint by priority of lastTransactedAt
export const purgeLoansWithSameMintByFreshness = <L>(loans: L[], getLoan: (loan: L) => Loan) => {
  const loansByMint = groupBy(loans, (loan) => getLoan(loan).nft.mint)

  return Object.values(loansByMint)
    .map((loansWithSameMint) =>
      maxBy(loansWithSameMint, (loan) => getLoan(loan).fraktBond.lastTransactedAt),
    )
    .flat() as L[]
}
