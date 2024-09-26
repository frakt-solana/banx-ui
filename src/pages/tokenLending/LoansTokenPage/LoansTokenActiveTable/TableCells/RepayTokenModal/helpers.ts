import { formatTrailingZeros } from '@banx/utils'

export const isFullRepayment = (percent: number) => percent === 100

export const formatWithMarketDecimals = (
  value: number,
  marketDecimals: number,
  decimalsPlaces = 4,
) => formatTrailingZeros((value / marketDecimals).toFixed(decimalsPlaces))
