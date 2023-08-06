import { SearchSelectProps } from '../SearchSelect'
import { SortDropdownProps } from '../SortDropdown'
import { ToggleProps } from '../Toggle'

interface Breakpoints {
  scrollX: number
  scrollY: number
}
export type PartialBreakpoints = Partial<Breakpoints>

export type SortParams = Omit<SortDropdownProps, 'options'>
export type ToggleParams = ToggleProps
export type SearchSelectParams<T> = SearchSelectProps<T>

export type SortViewParams<T> = {
  searchSelectParams: SearchSelectParams<T>
  sortParams?: SortParams
  toggleParams?: ToggleParams
}
