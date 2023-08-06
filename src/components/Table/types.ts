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
  //TODO: Add filter params, types searchSelectParams

  searchSelectParams: SearchSelectParams<T>
  sortParams?: SortParams
  toggleParams?: ToggleParams
}
