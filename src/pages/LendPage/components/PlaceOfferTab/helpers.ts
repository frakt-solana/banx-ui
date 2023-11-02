type ShouldShowDepositError = (props: {
  initialLoanValue?: number
  initialLoansAmount?: number
  solanaBalance: number
  offerSize: number
}) => boolean

export const shouldShowDepositError: ShouldShowDepositError = ({
  initialLoanValue = 0,
  initialLoansAmount = 0,
  solanaBalance,
  offerSize,
}) => {
  const initialOfferSize = initialLoansAmount * initialLoanValue
  const totalAvailableFunds = initialOfferSize + solanaBalance * 1e9

  return totalAvailableFunds < offerSize
}
