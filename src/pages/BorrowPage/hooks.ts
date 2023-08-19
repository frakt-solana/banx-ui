import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { isEmpty, uniqueId } from 'lodash'

import { Offer, fetchBorrowNftsAndOffers } from '@banx/api/core'

import { useCartState } from './cartState'
import { SimpleOffer } from './types'

export const useBorrowNfts = () => {
  const { setCart } = useCartState()

  const { publicKey: walletPublicKey } = useWallet()

  const { data, isLoading } = useQuery(
    ['walletBorrowNfts', walletPublicKey?.toBase58()],
    () => fetchBorrowNftsAndOffers({ walletPubkey: walletPublicKey?.toBase58() || '' }),
    {
      enabled: !!walletPublicKey,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
    },
  )

  const offers = useMemo(() => {
    return Object.fromEntries(
      Object.entries(data?.offers || {}).map(([marketPubkey, offers]) => {
        const simpleOffers = offers
          .map(spreadToSimpleOffers)
          .flat()
          .sort((a, b) => {
            return b.loanValue - a.loanValue
          })
        return [marketPubkey, simpleOffers]
      }),
    )
  }, [data])

  //? Set offers in cartState
  useEffect(() => {
    if (!isEmpty(offers)) {
      setCart({ offersByMarket: offers })
    }
  }, [setCart, offers])

  return {
    nfts: data?.nfts || [],
    rawOffers: data?.offers || {},
    isLoading,
  }
}

const spreadToSimpleOffers = (offer: Offer): SimpleOffer[] => {
  const { fundsSolOrTokenBalance, currentSpotPrice } = offer

  const fullOffersAmount = Math.floor(fundsSolOrTokenBalance / currentSpotPrice)

  const offers = Array(fullOffersAmount)
    .fill(currentSpotPrice)
    .map((loanValue) => ({
      id: uniqueId(),
      loanValue,
      hadoMarket: offer.hadoMarket,
      publicKey: offer.publicKey,
    }))

  const decimalLoanValue = fundsSolOrTokenBalance - currentSpotPrice * fullOffersAmount

  //? Add not full offer
  if (decimalLoanValue && decimalLoanValue > 0) {
    offers.push({
      id: uniqueId(),
      loanValue: decimalLoanValue,
      hadoMarket: offer.hadoMarket,
      publicKey: offer.publicKey,
    })
  }

  return offers
}
