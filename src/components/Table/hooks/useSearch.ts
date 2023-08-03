import { useMemo, useState } from 'react'

import { DebouncedFunc, debounce, get, isObject } from 'lodash'

type Event = { target: { value: string } }

type UseSearch = <T>(props: {
  data: ReadonlyArray<T>
  searchField?: string | string[]
  debounceWait?: number
  setQuerySearch?: (nextValue: string) => void
}) => {
  filteredData: ReadonlyArray<T>
  onChange: DebouncedFunc<(event: Event) => void>
}

export const useSearch: UseSearch = ({
  data,
  searchField = 'name',
  debounceWait = 100,
  setQuerySearch,
}) => {
  const [search, setSearch] = useState<string>('')

  const filteredData = useMemo(() => {
    if (!search) return data

    return data.filter((dataElement) => {
      const fieldValue = get(dataElement, searchField)
      const filterableString = isObject(fieldValue)
        ? JSON.stringify(fieldValue)
        : String(fieldValue)

      return filterableString.toUpperCase().includes(search.toUpperCase())
    })
  }, [search, data, searchField])

  const debounceSearch = (setSearchString: (nextValue: string) => void) => {
    return debounce((event: Event) => setSearchString(event.target.value || ''), debounceWait)
  }

  const onChange = setQuerySearch ? debounceSearch(setQuerySearch) : debounceSearch(setSearch)

  return {
    filteredData,
    onChange,
  }
}
