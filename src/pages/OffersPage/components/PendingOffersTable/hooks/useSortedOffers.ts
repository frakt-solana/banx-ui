import { useMemo } from 'react'

import { get, isFunction, sortBy } from 'lodash'

import { WEEKS_IN_YEAR } from '@banx/constants'

import { TableUserOfferData } from '../helpers'

enum SortField {
  OFFER = 'offer',
  LOANS = 'loans',
  SIZE = 'size',
  INTEREST = 'interest',
  APY = 'apy',
}

export const useSortedOffers = (offers: TableUserOfferData[], sortOptionValue: string) => {
  const sortedOffers = useMemo(() => {
    if (!sortOptionValue) {
      return offers
    }

    const [name, order] = sortOptionValue.split('_')

    type SortValueGetter = (offer: TableUserOfferData) => number

    const sortValueMapping: Record<SortField, string | SortValueGetter> = {
      [SortField.OFFER]: 'loanValue',
      [SortField.LOANS]: 'loansAmount',
      [SortField.SIZE]: 'size',
      [SortField.INTEREST]: (offer) => {
        const weeklyAprPercentage = offer.apr / WEEKS_IN_YEAR
        return (offer.size * weeklyAprPercentage) / 100
      },
      [SortField.APY]: 'apy',
    }

    const sorted = sortBy(offers, (offer) => {
      const sortValue = sortValueMapping[name as SortField]
      return isFunction(sortValue) ? sortValue(offer) : get(offer, sortValue)
    })

    return order === 'desc' ? sorted.reverse() : sorted
  }, [sortOptionValue, offers])

  return sortedOffers
}
