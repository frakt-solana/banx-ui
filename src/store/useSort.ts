import { useEffect } from 'react'

import { create } from 'zustand'

import { SortOption } from '@banx/components/SortDropdown'

interface SortState {
  sortOptionValue: string
  setSortOptionValue: (value: string) => void
}

const useSortState = create<SortState>((set) => ({
  sortOptionValue: '',
  setSortOptionValue: (value) => set({ sortOptionValue: value }),
}))

export const useSort = (key: string, initialValue: string) => {
  const { sortOptionValue, setSortOptionValue } = useSortState()

  useEffect(() => {
    const storedValue = localStorage.getItem(key)
    if (storedValue) {
      setSortOptionValue(storedValue)
    } else {
      localStorage.setItem(key, initialValue)
      setSortOptionValue(initialValue)
    }
  }, [key, initialValue, setSortOptionValue])

  useEffect(() => {
    localStorage.setItem(key, sortOptionValue)
  }, [key, sortOptionValue])

  return { sortOptionValue, setSortOptionValue }
}

interface CreateSortParamsProps {
  sortOptionValue: string
  setSortOptionValue: (value: string) => void
  defaultOption: SortOption
  options: SortOption[]
}

export const createSortParams = ({
  sortOptionValue,
  setSortOptionValue,
  defaultOption,
  options,
}: CreateSortParamsProps) => {
  const field = sortOptionValue.split('_')[0]

  const { value: defaultOptionValue, label: defaultOptionLabel } = defaultOption

  const option = {
    label: options.find(({ value }) => value === field)?.label || defaultOptionLabel,
    value: sortOptionValue || defaultOptionValue,
  }

  return {
    option,
    onChange: (option: SortOption) => setSortOptionValue(option.value),
    options,
  }
}
