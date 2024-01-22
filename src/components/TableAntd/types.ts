import { SearchSelectProps } from '../SearchSelect'
import { SortDropdownProps } from '../SortDropdown'
import { ToggleProps } from '../Toggle'

interface Breakpoints {
  scrollX: number
  scrollY: number
}

export type PartialBreakpoints = Partial<Breakpoints>

export interface SortViewParams<T> {
  searchSelectParams: SearchSelectProps<T>
  sortParams?: SortDropdownProps
  toggleParams?: ToggleProps
}

export interface ActiveRowParams<T> {
  field?: string
  condition: (record: T) => boolean
  cardClassName?: string
  className?: string
}
