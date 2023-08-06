import { SortDropdownProps } from '../SortDropdown'
import { ToggleProps } from '../Toggle'

interface Breakpoints {
  scrollX: number
  scrollY: number
}
export type PartialBreakpoints = Partial<Breakpoints>

export type SortParams = Omit<SortDropdownProps, 'options'>
export type ToggleParams = ToggleProps

export type SortViewParams = {
  //TODO: Add filter params, types searchSelectParams

  searchSelectParams: any
  sortParams?: SortParams
  toggleParams?: ToggleParams
}
