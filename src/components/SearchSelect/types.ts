//TODO: Need to add generic type instead of string
export interface OptionKeys {
  labelKey: string
  valueKey: string
  imageKey: string
  labelIcon?: {
    key: string
    icon: JSX.Element
  }
  secondLabel?: {
    key: string
    format?: (value: number) => number | string | JSX.Element
  }
}
