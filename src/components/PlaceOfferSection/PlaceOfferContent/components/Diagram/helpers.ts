import { chain, chunk, clamp, concat, filter, uniqBy } from 'lodash'

import { Loan } from '@banx/api/core'
import { SimpleOffer, calcLoanBorrowedAmount, formatDecimal } from '@banx/utils'

import { Mark } from './Diagram'
import { MAX_BOUND_PERCENTAGE, MAX_GROUP_SIZE, MIN_BOUND_PERCENTAGE } from './constants'

export const convertLoanToMark = (loan: Loan) => {
  return { value: calcLoanBorrowedAmount(loan), loan }
}

export const convertSimpleOfferToMark = (offer: SimpleOffer) => {
  return { value: offer.loanValue }
}

export const convertOfferToMark = (offerValue: number, index: number, delta: number) => {
  return { value: index === 0 ? offerValue : offerValue - delta * index }
}

const calculatePercentage = (value: number, total: number) => {
  const percentage = (value / total) * 100
  return clamp(percentage, MIN_BOUND_PERCENTAGE, MAX_BOUND_PERCENTAGE)
}

export const calcLeftPercentage = (
  markers: Mark[] | Mark[][],
  currentIndex: number,
  collectionFloor = 0,
) => {
  const uniqueMarks = chain(markers as Mark[][])
    .flatten()
    .uniqBy((mark) => mark.value)
    .value()

  if (uniqueMarks.length === 1) {
    return 100 - calculatePercentage(uniqueMarks[0].value, collectionFloor)
  }

  return calculatePercentage(currentIndex, markers.length - 1)
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

export const formatMarkValue = (value: number) => {
  if (!value) return '0'

  const formattedDecimalValue = formatDecimal(value / 1e9)
  return formattedDecimalValue.replace(/\.?0+$/, '')
}
