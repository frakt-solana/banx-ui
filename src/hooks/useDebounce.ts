import { useEffect, useRef, useState } from 'react'

import { debounce } from 'lodash'

type Callback<T> = (value?: T) => void

export const useDebounce = <T>(callback: Callback<T>, delay: number = 2000): Callback<T> => {
  const debouncedCallbackRef = useRef<Callback<T>>(debounce((value?: T) => callback(value), delay))
  return debouncedCallbackRef.current
}

export const useDebounceValue = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
