import { MarketPreview } from '@banx/api/core'

export const calcLoanToValuePercentage = (loanValue: string, marketPreview?: MarketPreview) => {
  const loanValueToNumber = parseFloat(loanValue) || 0

  const { collectionFloor = 0 } = marketPreview || {}

  const ltvPercentage = (loanValueToNumber / (collectionFloor / 1e9)) * 100
  return ltvPercentage
}
