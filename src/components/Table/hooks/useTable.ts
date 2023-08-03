import { get } from 'lodash'

import { useSearch } from './useSearch'

export const useTable = ({
  data,
  columns,
  onRowClick,
  rowKeyField = 'id',
  loading,
  searchParams = {
    debounceWait: 100,
    searchField: 'name',
    placeHolderText: 'Search by name',
  },
}: any) => {
  const { filteredData, onChange } = useSearch({
    data,
    searchField: get(searchParams, 'searchField', 'name'),
    debounceWait: get(searchParams, 'debounceWait', 100),
  })

  const search = {
    placeHolderText: get(searchParams, 'placeHolderText', 'Search by name'),
    onChange,
  }

  const table = {
    data: filteredData,
    columns,
    onRowClick,
    rowKeyField,
    loading,
  }

  return { table, search }
}
