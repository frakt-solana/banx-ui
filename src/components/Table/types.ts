import { Key, ReactElement, ReactNode } from 'react'

import { SearchSelectProps } from '../SearchSelect'
import { SortDropdownProps } from '../SortDropdown'
import { ToggleProps } from '../Toggle'

export type SortParams = Omit<SortDropdownProps, 'options'>

export interface SortViewParams<T> {
  searchSelectParams: SearchSelectProps<T>
  sortParams?: SortParams
  toggleParams?: ToggleProps
}

export interface ColumnType<T> {
  key: string | Key
  title?: ReactElement
  render: (record: T, key?: Key) => ReactNode
  sorter?: boolean
}

export type TableRowActiveParams<T> = Array<{
  field?: string
  condition: (record: T) => boolean
  cardClassName?: string
  className?: string
}>

export interface TableRowParams<T> {
  activeRowParams?: TableRowActiveParams<T>
  onRowClick?: (dataItem: T) => void
}

export interface TableViewProps<T> {
  data: Array<T>
  columns: ColumnType<T>[]
  loadMore?: () => void
  rowParams?: TableRowParams<T> //? Must be wrapped in useMemo because of render virtual table specific
  className?: string
}

export interface TableProps<T, P> extends TableViewProps<T> {
  loading?: boolean
  sortViewParams?: SortViewParams<P>
  showCard?: boolean
  classNameTableWrapper?: string
  emptyMessage?: string
}
