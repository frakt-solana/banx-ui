import { BN } from 'fbonds-core'
import { flatMap, map, reduce, uniq } from 'lodash'

import { BONDS } from '@banx/constants'

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

export const calcBorrowValueWithRentFee = (loanValue: number, marketPubkey: string) => {
  if (loanValue === 0) return 0
  if (marketPubkey === BONDS.FACELESS_MARKET_PUBKEY) return loanValue
  return loanValue - BONDS.BORROW_RENT_FEE
}

export const formatCompact = (value: string, maximumFractionDigits = 1) => {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits,
  }).format(parseFloat(value))
}

export const calcBorrowValueWithProtocolFee = (loanValue: number) =>
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

export const toDecimals = (v: string | number, decimals = 1e9) => {
  const _decimals = new BN(decimals)
  const _v = new BN(v)
  return _v.mul(_decimals).toString()
}
/* eslint-disable  @typescript-eslint/no-explicit-any */
export const fromDecimals = (v: string | number, decimals = 1e9, toFixed = 2): any => {
  return (parseFloat(v.toString()) / decimals).toFixed(toFixed)
}

export const limitDecimalPlaces = (inputValue: string, decimalPlaces = 3) => {
  const regex = new RegExp(`^-?\\d*(\\.\\d{0,${decimalPlaces}})?`)
  const match = inputValue.match(regex)
  return match ? match[0] : ''
}
