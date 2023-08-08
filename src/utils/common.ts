import { ColorBreakpoints } from '@banx/constants'

// shorten the checksummed version of the input address to have 4 characters at start and end
export const shortenAddress = (address: string, chars = 4): string => {
  return `${address?.slice(0, chars)}...${address?.slice(-chars)}`
}

export const copyToClipboard = (value: string): void => {
  navigator.clipboard.writeText(value)
}

export const convertAprToApy = (apr: number) => {
  const weekInYear = 52
  const compoundedInterest = 1 + apr / weekInYear
  const apy = Math.pow(compoundedInterest, weekInYear) - 1
  return apy * 100
}

export const formatNumbersWithCommas = (value: number | string) =>
  value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

export const getColorByPercent = (value: number, colorBreakpoints: ColorBreakpoints): string => {
  const limit = Object.keys(colorBreakpoints).find((limit) => value <= parseInt(limit))

  if (limit !== undefined) {
    return colorBreakpoints[parseInt(limit)] || colorBreakpoints[10]
  }

  return colorBreakpoints[10]
}
