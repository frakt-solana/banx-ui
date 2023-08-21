export interface OptionKeys {
  labelKey: string
  valueKey: string
  imageKey: string
  secondLabel?: {
    key: string
    format?: (value: number) => string
  }
}
