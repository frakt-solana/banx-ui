import { BN } from 'fbonds-core'

export const ZERO_BN = new BN(0)

export const bnToHuman = (value: BN, decimals = 9): number => {
  const valueStr = value.toString()

  return parseFloat(valueStr) / 10 ** decimals
}

//TODO Refactor to safe parsing
export const bnToFixed = (params: { value: BN; fractionDigits?: number; decimals?: number }) => {
  const { value, fractionDigits = 0, decimals = 9 } = params

  return bnToHuman(value, decimals).toFixed(fractionDigits)
}

export const stringToBN = (value: string, decimals = 9): BN => {
  const isValidFormatRegExp = new RegExp(/^\d*\.?\d*$/)

  if (!isValidFormatRegExp.test(value)) return ZERO_BN

  const [integerPart, fractionalPart] = value.split('.')

  if (isNaN(parseInt(integerPart))) return ZERO_BN

  const integer = new BN(integerPart).mul(new BN(10 ** decimals))

  const calculateFractionalPart = (fractionalPart: string) => {
    if (fractionalPart === '' || isNaN(parseInt(fractionalPart))) {
      return ZERO_BN
    }

    if (fractionalPart.length >= decimals) {
      return new BN(fractionalPart.slice(0, decimals))
    }

    return new BN(fractionalPart).mul(new BN(10 ** (decimals - fractionalPart.length)))
  }

  const fractional = calculateFractionalPart(fractionalPart)

  return integer.add(fractional)
}

export const sumBNs = (values: BN[]): BN => values.reduce((acc, value) => acc.add(value), ZERO_BN)
