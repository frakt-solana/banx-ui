import { BN } from 'fbonds-core'

export const bnToHuman = (value: BN, decimals = 9): number => {
  const valueStr = value.toString()

  return parseFloat(valueStr) / 10 ** decimals
}

//TODO Refactor to safe parsing
export const bnToFixed = (params: { value: BN; fractionDigits?: number; decimals?: number }) => {
  const { value, fractionDigits = 0, decimals = 9 } = params

  return bnToHuman(value, decimals).toFixed(fractionDigits)
}
