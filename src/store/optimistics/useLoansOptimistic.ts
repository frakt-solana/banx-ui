import { uniqBy } from 'lodash'
import moment from 'moment'
import { create } from 'zustand'

import { Loan } from '@banx/api/core'

const BANX_LOANS_OPTIMISTICS_LS_KEY = '@banx.loansOptimistics'
const LOANS_CACHE_TIME_UNIX = 60 //? 60 seconds

interface LoansOptimisticStore {
  loans: Loan[]
  setLoans: (...loans: Loan[]) => void
}

const useOptimisticLoansStore = create<LoansOptimisticStore>((set) => ({
  loans: [],
  setLoans: (...loans) => {
    set((state) => ({ ...state, loans }))
  },
}))

export interface UseOptimisticLoansValues {
  loans: Loan[]
  find: (publicKey: string) => Loan | undefined
  add: (...loans: Loan[]) => void
  remove: (...publicKeys: string[]) => void
  update: (...loans: Loan[]) => void
}
export const useOptimisticLoans = (): UseOptimisticLoansValues => {
  const { loans: optimisticLoans, setLoans: setOptimisticLoans } = useOptimisticLoansStore(
    (state: LoansOptimisticStore) => {
      try {
        const optimisticLoans = getOptimisticLoansLS()
        const loans = optimisticLoans.filter((l) => !isExpired(l)).map(({ loan }) => loan)
        if (loans.length < optimisticLoans.length) {
          setOptimisticLoansLS(loans)
        }
        return {
          ...state,
          loans,
        }
      } catch (error) {
        console.error(error)
        return state
      }
    },
  )

  const add = (...loans: Loan[]) => {
    const nextLoans = addLoans(optimisticLoans, loans)
    setOptimisticLoansLS(nextLoans)
    setOptimisticLoans(...nextLoans)
  }

  const remove = (...publicKeys: string[]) => {
    const nextLoans = removeLoans(optimisticLoans, publicKeys)
    setOptimisticLoansLS(nextLoans)
    setOptimisticLoans(...nextLoans)
  }

  const find = (publicKey: string) => {
    return findLoan(optimisticLoans, publicKey)
  }

  const update = (...loans: Loan[]) => {
    const nextLoans = updateLoans(optimisticLoans, loans)
    setOptimisticLoansLS(nextLoans)
    setOptimisticLoans(...nextLoans)
  }

  return { loans: optimisticLoans, add, remove, find, update }
}

interface LoanWithExpiration {
  loan: Loan
  expiredAt: number
}

const isExpired = (loanWithExpiration: LoanWithExpiration) =>
  loanWithExpiration.expiredAt < moment().unix()

const setOptimisticLoansLS = (loans: Loan[]) => {
  const expiredAt = moment().unix() + LOANS_CACHE_TIME_UNIX
  const loansWithExpiration: LoanWithExpiration[] = loans.map((loan) => ({ loan, expiredAt }))
  localStorage.setItem(BANX_LOANS_OPTIMISTICS_LS_KEY, JSON.stringify(loansWithExpiration))
}

const getOptimisticLoansLS = () => {
  const optimisticLoans = localStorage.getItem(BANX_LOANS_OPTIMISTICS_LS_KEY)
  return (optimisticLoans ? JSON.parse(optimisticLoans) : []) as LoanWithExpiration[]
}

const addLoans = (loansState: Loan[], loansToAdd: Loan[]) =>
  uniqBy([...loansState, ...loansToAdd], ({ publicKey }) => publicKey)

const removeLoans = (loansState: Loan[], loansPubkeysToRemove: string[]) =>
  loansState.filter(({ publicKey }) => !loansPubkeysToRemove.includes(publicKey))

const findLoan = (loansState: Loan[], loanPublicKey: string) =>
  loansState.find((l) => l.publicKey === loanPublicKey)

const updateLoans = (loansState: Loan[], loansToAddOrUpdate: Loan[]) => {
  const publicKeys = loansToAddOrUpdate.map(({ publicKey }) => publicKey)
  const sameLoansRemoved = removeLoans(loansState, publicKeys)
  return addLoans(sameLoansRemoved, loansToAddOrUpdate)
}
