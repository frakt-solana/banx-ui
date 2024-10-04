import { web3 } from 'fbonds-core'
import { calcBorrowerTokenAPR } from 'fbonds-core/lib/fbond-protocol/helpers'
import { map, sumBy } from 'lodash'

import { TokenLoan } from '@banx/api/tokens'
import {
  caclulateBorrowTokenLoanValue,
  calcTokenWeeklyFeeWithRepayFee,
  calcWeightedAverage,
  isTokenLoanRepaymentCallActive,
} from '@banx/utils'

import { calcTokenTotalValueToPay } from '../../helpers'

export const getPayInterestActionText = (loans: TokenLoan[]) => {
  if (loans.length === 0) return 'Pay'

  const hasActiveRepaymentCall = loans.some(isTokenLoanRepaymentCallActive)
  const noActiveRepaymentCalls = loans.every((loan) => !isTokenLoanRepaymentCallActive(loan))

  if (hasActiveRepaymentCall && !noActiveRepaymentCalls) return 'Repayment call'
  if (noActiveRepaymentCalls) return 'Pay interest'

  return 'Pay'
}

const calculateWeightedApr = (loans: TokenLoan[]) => {
  const totalAprValues = map(loans, (loan) => {
    const marketPubkey = new web3.PublicKey(loan.fraktBond.hadoMarket)
    return calcBorrowerTokenAPR(loan.bondTradeTransaction.amountOfBonds, marketPubkey) / 100
  })

  const totalRepayValues = map(loans, (loan) => caclulateBorrowTokenLoanValue(loan).toNumber())

  return calcWeightedAverage(totalAprValues, totalRepayValues)
}

export const calculateLoansStats = (loans: TokenLoan[]) => {
  const totalSelectedLoans = loans.length

  const totalDebt = sumBy(loans, (loan) => caclulateBorrowTokenLoanValue(loan).toNumber())
  const totalWeeklyFee = sumBy(loans, calcTokenWeeklyFeeWithRepayFee)
  const totalValueToPay = sumBy(loans, calcTokenTotalValueToPay)
  const weightedApr = calculateWeightedApr(loans)

  return { totalSelectedLoans, totalDebt, totalWeeklyFee, totalValueToPay, weightedApr }
}
