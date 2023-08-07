import { SearchSelectProps } from '../SearchSelect'
import { SortDropdownProps } from '../SortDropdown'
import { ToggleProps } from '../Toggle'

interface Breakpoints {
  scrollX: number
  scrollY: number
}

export type PartialBreakpoints = Partial<Breakpoints>

export type SortParams = Omit<SortDropdownProps, 'options'>
export type SearchSelectParams<T> = SearchSelectProps<T>
export type ToggleParams = ToggleProps

export interface SortViewParams<T> {
  searchSelectParams: SearchSelectParams<T>
  sortParams?: SortParams
  toggleParams?: ToggleParams
}

export interface ActiveRowParams {
  field: string
  value: boolean
  className: string
  cardClassName?: string
}
