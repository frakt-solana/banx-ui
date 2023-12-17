import { slice, sum } from 'lodash'

import { Loan } from '@banx/api/core'
import { SimpleOffer } from '@banx/pages/BorrowPage/types'
import { calcLoanBorrowedAmount } from '@banx/utils'

export const convertLoanToMark = (loan: Loan) => {
  return { value: calcLoanBorrowedAmount(loan), loan }
}

export const convertSimpleOfferToMark = (offer: SimpleOffer) => {
  return { value: offer.loanValue }
}

export const convertOfferToMark = (offerValue: number, index: number, delta: number) => {
  return { value: index === 0 ? offerValue : offerValue - delta * index }
}

export const calcLeftPercentage = (values: number[], currentIndex: number) => {
  const sumOfLoanValues = sum(values)
  const accumulatedSum = sum(slice(values, 0, currentIndex + 1))

  return (accumulatedSum / sumOfLoanValues) * 100
}
