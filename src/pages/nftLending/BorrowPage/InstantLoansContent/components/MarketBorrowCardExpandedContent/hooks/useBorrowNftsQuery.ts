import { useEffect, useMemo } from 'react'

import { isEmpty, maxBy } from 'lodash'

import { useBorrowNftsAndMarketsQuery } from '@banx/pages/nftLending/BorrowPage'
import { convertOffersToSimple } from '@banx/utils'

import { useCartState } from './useCartState'

export const useBorrowNftsQuery = (marketPubkey: string) => {
  const { nftsByMarket, isLoading, userVaults, offersByMarket } = useBorrowNftsAndMarketsQuery()
  const { setCart } = useCartState()

  const rawOffers = useMemo(() => {
    return offersByMarket[marketPubkey] || []
  }, [offersByMarket, marketPubkey])

  const nfts = useMemo(() => {
    return nftsByMarket[marketPubkey] || []
  }, [marketPubkey, nftsByMarket])

  const simpleOffers = useMemo(() => {
    return convertOffersToSimple({ offers: rawOffers, userVaults: userVaults, sort: 'desc' })
  }, [userVaults, rawOffers])

  //? Set offers in cartState
  useEffect(() => {
    if (!isEmpty(simpleOffers) && !isEmpty(userVaults)) {
      setCart({ offers: simpleOffers })
    } else {
      setCart({ offers: [] })
    }
  }, [setCart, simpleOffers, userVaults])

  const maxLoanValueOnMarket = useMemo(() => {
    const bestOffer = maxBy(simpleOffers, ({ loanValue }) => loanValue)
    return bestOffer?.loanValue || 0
  }, [simpleOffers])

  return {
    isLoading,
    nfts,
    rawOffers,
    userVaults,
    maxLoanValueOnMarket,
  }
}
