//TODO: Need remove string type
export interface OptionKeys<P> {
  labelKey: keyof P | string
  valueKey: keyof P | string
  imageKey: keyof P | string
  secondLabel?: {
    key: keyof P | string
    format?: (value: number) => string
  }
}
