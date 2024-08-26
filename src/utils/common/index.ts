import { flowRight } from 'lodash'

import { stringToBN } from '../bn'

// shorten the checksummed version of the input address to have 4 characters at start and end
export const shortenAddress = (address: string, chars = 4): string => {
  return `${address?.slice(0, chars)}...${address?.slice(-chars)}`
}

export const copyToClipboard = (value: string): void => {
  navigator.clipboard.writeText(value)
}

export const pasteFromClipboard = async (): Promise<string> => {
  try {
    const text = await navigator.clipboard.readText()
    return text
  } catch (err) {
    console.error('Error reading from clipboard:', err)
    return ''
  }
}
export const formatNumbersWithCommas = (value: number | string) =>
  value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

export const formatCompact = (value: string, maximumFractionDigits = 1) => {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits,
  }).format(parseFloat(value))
}

export const createDownloadLink = (data: string, filename: string, type?: string) => {
  const blobType = type || 'text/csv'
  const blob = new Blob([data], { type: blobType })
  const blobURL = window.URL.createObjectURL(blob)

  const tempLink = document.createElement('a')
  tempLink.href = blobURL
  tempLink.download = filename
  tempLink.click()

  window.URL.revokeObjectURL(blobURL)
}

export const formatTrailingZeros = (value: string) =>
  value.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')

export const limitDecimalPlaces = (inputValue: string, decimalPlaces = 3) => {
  const regex = new RegExp(`^-?\\d*(\\.\\d{0,${decimalPlaces}})?`)
  const match = inputValue.match(regex)
  return match ? formatTrailingZeros(match[0]) : ''
}

export const stringToHex = (str: string, decimals?: number): string => {
  return stringToBN(str, decimals).toString(16).toUpperCase()
}

export const convertAprToApy = (apr: number, compoundingPeriods = 1) => {
  const apy = (1 + apr / compoundingPeriods) ** compoundingPeriods - 1
  return apy * 100
}

const isExponentialNotation = (n: number) => {
  const numStr = n.toString()
  return numStr.includes('e') || numStr.includes('E')
}

export const convertToDecimalString = (n: number, precision = 0) => {
  if (!isExponentialNotation(n)) return n.toString()

  const powOfE = flowRight(Math.abs, Math.floor, Math.log10, Math.abs)(n)
  return n.toFixed(powOfE + precision)
}
