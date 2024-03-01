import { isFunction } from 'lodash'
import { create } from 'zustand'

type State<T> = {
  value: T
  setValue: (newValue: T | ((prevValue: T) => T)) => void
}

export const createGlobalState = <T>(defaultValue?: T) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const useStore = create<State<any>>((set) => ({
    value: defaultValue ?? undefined,
    setValue: (newValue: T | ((prevValue: T) => T)) =>
      set((state) => ({
        value: isFunction(newValue) ? (newValue as (prevValue: T) => T)(state.value) : newValue,
      })),
  }))

  return () => {
    const state = useStore((state) => state.value)
    const setState = useStore((state) => state.setValue)

    return [state, setState] as [State<T>['value'], State<T>['setValue']]
  }
}
