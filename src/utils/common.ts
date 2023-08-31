import { flatMap, map, uniq } from 'lodash'

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
