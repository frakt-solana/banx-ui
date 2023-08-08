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

export interface ActiveRowParams {
  field: string
  value: boolean
  className: string
  cardClassName?: string
}
