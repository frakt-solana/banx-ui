import { SortDropdownProps } from '../SortDropdown'
import { ToggleProps } from '../Toggle'

interface Breakpoints {
  mobile: number
  scrollX: number
  scrollY: number
}
export type PartialBreakpoints = Partial<Breakpoints>

export type SortParams = Omit<SortDropdownProps, 'options'>
export type ToggleParams = ToggleProps
