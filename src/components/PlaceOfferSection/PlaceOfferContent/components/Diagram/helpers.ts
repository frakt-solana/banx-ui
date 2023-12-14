import { Loan } from '@banx/api/core'
import { SimpleOffer } from '@banx/pages/BorrowPage/types'
import { calcLoanBorrowedAmount } from '@banx/utils'

export const convertLoanToMark = (loan: Loan) => {
  return { loanValue: calcLoanBorrowedAmount(loan) / 1e9, loan }
}

export const convertSimpleOfferToMark = (offer: SimpleOffer) => {
  return { loanValue: offer.loanValue / 1e9 }
}

export const convertOfferToMark = (offerValue: number, index: number, delta: number) => {
  return { loanValue: index === 0 ? offerValue : offerValue - delta * index }
}
