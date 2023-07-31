import { create } from 'zustand'

const FRAKT_IS_LEDGER_LS_KEY = '@frakt.isLedger'

interface IsLedgerState {
  isLedger: boolean
  setIsLedger: (nextValue: boolean) => void
}

const useIsLedgerState = create<IsLedgerState>((set) => ({
  isLedger: false,
  setIsLedger: (nextValue) => set((state) => ({ ...state, isLedger: nextValue })),
}))

export const useIsLedger = () => {
  const { isLedger, setIsLedger } = useIsLedgerState((state) => {
    try {
      const item = localStorage.getItem(FRAKT_IS_LEDGER_LS_KEY)
      return {
        ...state,
        isLedger: item ? JSON.parse(item) : false,
      }
    } catch (error) {
      console.error(error)
      return {
        ...state,
        isLedger: false,
      }
    }
  })

  const setValue = (value: boolean) => {
    try {
      setIsLedger(value)
      localStorage.setItem(FRAKT_IS_LEDGER_LS_KEY, JSON.stringify(value))
    } catch (error) {
      console.error(error)
    }
  }

  return { isLedger, setIsLedger: setValue }
}
