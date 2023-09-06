import { map, uniqBy } from 'lodash'
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

interface LoansOptimisticStore {
  optimisticLoans: LoanOptimistic[]
  setLoans: (...loans: LoanOptimistic[]) => void
}

const useOptimisticLoansStore = create<LoansOptimisticStore>((set) => ({
  optimisticLoans: [],
  setLoans: (...loans) => {
    set((state) => ({ ...state, optimisticLoans: loans }))
  },
}))

export interface UseOptimisticLoansValues {
  loans: LoanOptimistic[]
  find: (publicKey: string, walletPublicKey: string) => LoanOptimistic | undefined
  add: (loans: Loan[], walletPublicKey: string) => void
  remove: (publicKeys: string[], walletPublicKey: string) => void
  update: (loans: Loan[], walletPublicKey: string) => void
}
export const useOptimisticLoans = (): UseOptimisticLoansValues => {
  const { optimisticLoans: optimisticLoans, setLoans: setOptimisticLoans } =
    useOptimisticLoansStore((state: LoansOptimisticStore) => {
      try {
        const optimisticLoans = getOptimisticLoansLS()
        setOptimisticLoansLS(optimisticLoans)

        return {
          ...state,
          optimisticLoans: optimisticLoans,
        }
      } catch (error) {
        console.error(error)
        setOptimisticLoansLS([])

        return {
          ...state,
          optimisticLoans: [],
        }
      }
    })

  const add: UseOptimisticLoansValues['add'] = (loans, walletPublicKey) => {
    if (!walletPublicKey) return
    const nextLoans = addLoans(
      optimisticLoans,
      map(loans, (loan) => convertLoanToOptimistic(loan, walletPublicKey)),
    )
    setOptimisticLoansLS(nextLoans)
    setOptimisticLoans(...nextLoans)
  }

  const remove: UseOptimisticLoansValues['remove'] = (publicKeys) => {
    const nextLoans = removeLoans(optimisticLoans, publicKeys)
    setOptimisticLoansLS(nextLoans)
    setOptimisticLoans(...nextLoans)
  }

  const find: UseOptimisticLoansValues['find'] = (publicKey, walletPublicKey) => {
    return findLoan(optimisticLoans, publicKey, walletPublicKey)
  }

  const update: UseOptimisticLoansValues['update'] = (loans: Loan[], walletPublicKey) => {
    const nextLoans = updateLoans(
      optimisticLoans,
      map(loans, (loan) => convertLoanToOptimistic(loan, walletPublicKey)),
    )
    setOptimisticLoansLS(nextLoans)
    setOptimisticLoans(...nextLoans)
  }

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

const addLoans = (loansState: LoanOptimistic[], loansToAdd: LoanOptimistic[]) =>
  uniqBy([...loansState, ...loansToAdd], ({ loan }) => loan.publicKey)

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
