import { useMemo } from 'react'

import { chain, isEmpty } from 'lodash'

import { convertOffersToSimple } from '@banx/utils'

import { useBorrowNftsAndMarketsQuery } from '../../hooks'

export const useListLoansBorrowNfts = () => {
  const { nftsByMarket, userVaults, isLoading, offersByMarket } = useBorrowNftsAndMarketsQuery()

  const maxLoanValueByMarket: Record<string, number> = useMemo(() => {
    if (isEmpty(offersByMarket)) return {}

    const simpleOffers = chain(offersByMarket)
      .toPairs()
      .map(([marketPubkey, offers]) => {
        const simpleOffers = convertOffersToSimple(offers, userVaults, 'desc')
        return [marketPubkey, simpleOffers]
      })
      .fromPairs()
      .value()

    return chain(simpleOffers)
      .keys()
      .map((hadoMarket) => {
        const price = simpleOffers[hadoMarket]?.[0]?.loanValue || 0
        return [hadoMarket, price]
      })
      .fromPairs()
      .value()
  }, [offersByMarket, userVaults])

  return {
    nftsByMarket,
    isLoading,
    maxLoanValueByMarket,
  }
}
