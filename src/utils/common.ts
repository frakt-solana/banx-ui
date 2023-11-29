import { flatMap, map, reduce, uniq } from 'lodash'

import {
  BONDS,
  DECIMAL_THRESHOLD,
  MIN_DISPLAY_VALUE,
  THREE_DECIMAL_PLACES,
  TWO_DECIMAL_PLACES,
  WEEKS_IN_YEAR,
} from '@banx/constants'

// shorten the checksummed version of the input address to have 4 characters at start and end
export const shortenAddress = (address: string, chars = 4): string => {
  return `${address?.slice(0, chars)}...${address?.slice(-chars)}`
}

export const copyToClipboard = (value: string): void => {
  navigator.clipboard.writeText(value)
}

//? takes and return the value in normal percent, F.e 30 => 30%
export const convertAprToApy = (apr: number) => {
  // const compoundedInterest = 1 + apr / WEEKS_IN_YEAR
  // const apr = Math.pow(compoundedInterest, WEEKS_IN_YEAR) - 1

  return Math.round(apr * 100)
}

export const getDecimalPlaces = (value: number | string) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value

  if (!numericValue) return TWO_DECIMAL_PLACES

  return numericValue < DECIMAL_THRESHOLD ? THREE_DECIMAL_PLACES : TWO_DECIMAL_PLACES
}

export const formatDecimal = (value: number) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value

  if (numericValue < MIN_DISPLAY_VALUE) return `<${MIN_DISPLAY_VALUE}`

  const decimalPlaces = getDecimalPlaces(numericValue)
  return numericValue.toFixed(decimalPlaces)
}

export const formatNumbersWithCommas = (value: number | string) =>
  value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

//? Placeholder for sendTxn callback in SDK methods
export const sendTxnPlaceHolder = async (): Promise<void> => await Promise.resolve()

export const generateCSVContent = <T extends object>(dataList: T[]): string => {
  const allKeys = flatMap(dataList, (data) => Object.keys(data))
  const csvHeaders = uniq(allKeys)

  const csvRows = dataList.map((data) => {
    const rowValues = map(csvHeaders, (header) => data[header as keyof T])
    return rowValues.join(',')
  })

  const csvContent = [csvHeaders.join(','), ...csvRows].join('\n')
  return csvContent
}

export const calcLoanValueWithProtocolFee = (loanValue: number) =>
  Math.floor(loanValue * (1 - BONDS.PROTOCOL_FEE_PERCENT / 1e4))

export const calcWeightedAverage = (nums: number[], weights: number[]) => {
  const [sum, weightSum] = reduce(
    weights,
    (acc, weight, i) => {
      acc[0] += nums[i] * weight
      acc[1] += weight
      return acc
    },
    [0, 0],
  )

  const weightedAverage = sum / weightSum
  return weightedAverage || 0
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
