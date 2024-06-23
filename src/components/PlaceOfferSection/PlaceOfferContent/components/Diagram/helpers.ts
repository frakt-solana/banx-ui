import { chain, chunk, clamp, concat, filter, uniqBy } from 'lodash'

import { core } from '@banx/api/nft'
import { SimpleOffer, calculateBorrowedAmount } from '@banx/utils'

import { Mark } from './Diagram'
import { MAX_BOUND_PERCENTAGE, MAX_GROUP_SIZE, MIN_BOUND_PERCENTAGE } from './constants'

export const convertLoanToMark = (loan: core.Loan) => {
  return { value: calculateBorrowedAmount(loan).toNumber(), loan }
}

export const convertSimpleOfferToMark = (offer: SimpleOffer) => {
  return { value: offer.loanValue }
}

export const convertOfferToMark = (offerValue: number, index: number, delta: number) => {
  return { value: index === 0 ? offerValue : offerValue - delta * index }
}

export const calcLeftPercentage = (markers: Mark[] | Mark[][], currentIndex: number) => {
  const percentage = (currentIndex / (markers.length - 1)) * 100 || 0
  return clamp(percentage, MIN_BOUND_PERCENTAGE, MAX_BOUND_PERCENTAGE)
}

export const groupMarks = (markers: Mark[]): Mark[] | Mark[][] => {
  const uniqueMarks = uniqBy(markers, (mark) => mark.value)

  // //? If all marks have the same value, group them by value. Used for offers without delta
  if (uniqueMarks.length === 1) {
    return chain(markers)
      .groupBy((mark) => mark.value)
      .values()
      .value()
  }

  if (markers.length <= MAX_GROUP_SIZE) {
    return markers
  }

  const groupSize = Math.ceil(markers.length / MAX_GROUP_SIZE)
  const marksWithLoan = filter(markers, (mark) => mark.loan !== undefined)
  const marksWithoutLoan = filter(markers, (mark) => mark.loan === undefined)

  const groupedMarksWithLoan = chunk(marksWithLoan, groupSize)
  const groupedMarksWithoutLoan = chunk(marksWithoutLoan, groupSize)

  return concat(groupedMarksWithLoan, groupedMarksWithoutLoan)
}

export const calculateStyle = (left: number) => `calc(${left}% - 24px)`
