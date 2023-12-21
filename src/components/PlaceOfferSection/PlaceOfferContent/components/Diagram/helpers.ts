import { chunk, clamp, concat, filter } from 'lodash'

import { Loan } from '@banx/api/core'
import { SimpleOffer } from '@banx/pages/BorrowPage/types'
import { calcLoanBorrowedAmount } from '@banx/utils'

import { Mark } from './Diagram'
import { MAX_GROUP_SIZE, MAX_LEFT_PERCENTAGE, MIN_LEFT_PERCENTAGE } from './constants'

export const convertLoanToMark = (loan: Loan) => {
  return { value: calcLoanBorrowedAmount(loan), loan }
}

export const convertSimpleOfferToMark = (offer: SimpleOffer) => {
  return { value: offer.loanValue }
}

export const convertOfferToMark = (offerValue: number, index: number, delta: number) => {
  return { value: index === 0 ? offerValue : offerValue - delta * index }
}

export const calcLeftPercentage = (values: Mark[] | Mark[][], currentIndex: number) => {
  const percentage = (currentIndex / (values.length - 1)) * 100
  return clamp(percentage, MIN_LEFT_PERCENTAGE, MAX_LEFT_PERCENTAGE)
}

export const groupMarks = (marks: Mark[]): Mark[] | Mark[][] => {
  if (marks.length <= MAX_GROUP_SIZE) {
    return marks
  }

  const groupSize = Math.ceil(marks.length / MAX_GROUP_SIZE)
  const marksWithLoan = filter(marks, (mark) => mark.loan !== undefined)
  const marksWithoutLoan = filter(marks, (mark) => mark.loan === undefined)

  const groupedMarksWithLoan = chunk(marksWithLoan, groupSize)
  const groupedMarksWithoutLoan = chunk(marksWithoutLoan, groupSize)

  return concat(groupedMarksWithLoan, groupedMarksWithoutLoan)
}

export const calculateStyle = (left: number) => `calc(${left}% - 24px)`
