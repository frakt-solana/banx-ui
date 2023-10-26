import { MarketPreview } from '@banx/api/core'

export const shouldShowDepositError = ({
  initialLoanValue = 0,
  initialLoansAmount = 0,
  solanaBalance,
  offerSize,
}: {
  initialLoanValue?: number
  initialLoansAmount?: number
  solanaBalance: number
  offerSize: number
}) => {
  const initialOfferSize = initialLoansAmount * initialLoanValue
  const totalAvailableFunds = initialOfferSize + solanaBalance

  const isDepositErrorVisible = totalAvailableFunds < offerSize
  return isDepositErrorVisible
}

const TRANSACTION_FEE = 0.01

export const calculateBestLoanValue = (solanaBalance: number, bestOffer: number) => {
  const balanceAfterDeductingFee = solanaBalance - TRANSACTION_FEE
  const maxLoanValue = Math.max(balanceAfterDeductingFee, 0)

  const bestOfferInSol = bestOffer / 1e9 || 0

  const defaultLoanValue = Math.min(maxLoanValue, bestOfferInSol) || 0
  return defaultLoanValue.toFixed(2)
}

export const calcLoanToValuePercentage = (loanValue: string, marketPreview?: MarketPreview) => {
  const loanValueToNumber = parseFloat(loanValue) || 0

  const { collectionFloor = 0 } = marketPreview || {}

  const ltvPercentage = (loanValueToNumber / (collectionFloor / 1e9)) * 100
  return ltvPercentage
}
