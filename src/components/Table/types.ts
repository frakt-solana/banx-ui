import { CSSProperties, Key, ReactElement, ReactNode } from 'react'

import { SearchSelectProps } from '../SearchSelect'
import { SortDropdownProps } from '../SortDropdown'
import { ToggleProps } from '../Toggle'

export interface SortViewParams<SearchType, SortType> {
  searchSelectParams: SearchSelectProps<SearchType>
  sortParams?: SortDropdownProps<SortType>
  toggleParams?: ToggleProps
}

export interface ColumnType<T> {
  key: string | Key
  title?: ReactElement
  render: (record: T, key?: Key) => ReactNode
}

export type ActiveRowParams<T> = Array<{
  field?: string
  condition: (record: T) => boolean
  cardClassName?: string
  className?: string
  styles?: (record: T) => CSSProperties
}>

export interface TableRowParams<T> {
  activeRowParams?: ActiveRowParams<T>
  onRowClick?: (dataItem: T) => void
}

export interface TableViewProps<T> {
  data: Array<T>
  columns: ColumnType<T>[]
  rowParams?: TableRowParams<T> //? Must be wrapped in useMemo because of render virtual table specific
  loadMore?: () => void
  className?: string
}

export interface TableProps<DataType, SearchType, SortType> extends TableViewProps<DataType> {
  sortViewParams?: SortViewParams<SearchType, SortType>

  classNameTableWrapper?: string
  emptyMessage?: string
  customJSX?: ReactNode
  showCard?: boolean

  loaderSize?: 'large' | 'default' | 'small'
  loaderClassName?: string
  loading?: boolean
}
