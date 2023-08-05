import { useState } from 'react'

import { SortOption } from './SortDropdown'

export const useSortDropdown = (defaultOption: SortOption) => {
  const [sortOption, setSortOption] = useState(defaultOption)

  const handleSortChange = (option: SortOption) => {
    setSortOption(option)
  }

  return { sortOption, handleSortChange }
}
