//TODO: Need to add P key instead of string
export interface OptionKeys {
  labelKey: string
  valueKey: string
  imageKey: string
  secondLabel?: {
    key: string
    format?: (value: number) => number | string | JSX.Element
  }
}
