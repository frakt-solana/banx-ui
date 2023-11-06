import React, { ReactNode } from 'react'

import { SearchSelectProps } from '../SearchSelect'
import { SortDropdownProps } from '../SortDropdown'
import { ToggleProps } from '../Toggle'

interface Breakpoints {
  scrollX: number
  scrollY: number
}

export type PartialBreakpoints = Partial<Breakpoints>

export type SortParams = Omit<SortDropdownProps, 'options'>

export interface SortViewParams<T> {
  searchSelectParams: SearchSelectProps<T>
  sortParams?: SortParams
  toggleParams?: ToggleProps
}

export interface ActiveRowParams<T> {
  field?: string
  condition: (record: T) => boolean
  cardClassName?: string
  className?: string
}

export interface ColumnType<T> {
  key?: string | React.Key
  dataIndex?: React.Key
  title?: string | ReactNode
  render: (record: T, index: number) => ReactNode
  showSorterTooltip?: boolean
  sorter?: boolean
}
