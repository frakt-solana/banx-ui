import { useEffect, useState } from 'react'

import { SortOption } from '@banx/components/SortDropdown'

export const useSort = (key: string, initialValue: string) => {
  const storedValue = localStorage.getItem(key)
  const [sortOptionValue, setSortOptionValue] = useState<string>(storedValue || initialValue)

  useEffect(() => {
    if (!storedValue) {
      localStorage.setItem(key, initialValue)
    }
  }, [key, initialValue, storedValue])

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
