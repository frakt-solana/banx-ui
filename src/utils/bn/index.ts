import { BN } from 'fbonds-core'

export const bnToHuman = (value: BN, decimals = 9): number => {
  const valueStr = value.toString()

  return parseFloat(valueStr) / 10 ** decimals
}

//TODO Add bnToFixed BN -> string function