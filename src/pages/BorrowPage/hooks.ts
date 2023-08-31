import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { produce } from 'immer'
import { countBy, isEmpty, sumBy, uniqueId } from 'lodash'
import { create } from 'zustand'

import { BorrowNft, Offer, fetchBorrowNftsAndOffers } from '@banx/api/core'
import { calcLoanValueWithProtocolFee } from '@banx/utils'

import { useCartState } from './cartState'
import { SimpleOffer, SimpleOffersByMarket } from './types'

export const useBorrowNfts = () => {
  const { setCart } = useCartState()
  const { mints: hiddenMints } = useHiddenNftsMints()

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

  const nfts = useMemo(() => {
    if (!data) {
      return []
    }
    return data.nfts.filter(({ mint }) => !hiddenMints.includes(mint))
  }, [data, hiddenMints])

  //TODO: Remove when borrow staked nfts support appears
  const notStakedNfts = useMemo(() => {
    // return nfts.filter((nft) => !nft.loan.banxStake)
    return nfts
  }, [nfts])

  const maxBorrow = useMemo(() => {
    return calcMaxBorrow(notStakedNfts, offers)
  }, [notStakedNfts, offers])

  return {
    nfts: notStakedNfts || [],
    rawOffers: data?.offers || {},
    maxBorrow,
    isLoading,
  }
}

const calcMaxBorrow = (nfts: BorrowNft[], offers: SimpleOffersByMarket) => {
  const nftsAmountByMarket = countBy(nfts, ({ loan }) => loan.marketPubkey)

  return Object.entries(nftsAmountByMarket).reduce((maxBorrow, [marketPubkey, nftsAmount]) => {
    const maxBorrowMarket = sumBy(
      (offers[marketPubkey] || []).slice(0, nftsAmount),
      ({ loanValue }) => loanValue,
    )

    return maxBorrow + maxBorrowMarket
  }, 0)
}

const spreadToSimpleOffers = (offer: Offer): SimpleOffer[] => {
  const { fundsSolOrTokenBalance, currentSpotPrice } = offer

  const fullOffersAmount = Math.floor(fundsSolOrTokenBalance / currentSpotPrice)

  const offers = Array(fullOffersAmount)
    .fill(currentSpotPrice)
    .map((loanValue) => ({
      id: uniqueId(),
      loanValue: calcLoanValueWithProtocolFee(loanValue),
      hadoMarket: offer.hadoMarket,
      publicKey: offer.publicKey,
    }))

  const decimalLoanValue = fundsSolOrTokenBalance - currentSpotPrice * fullOffersAmount

  //? Add not full offer
  if (decimalLoanValue && decimalLoanValue > 0) {
    offers.push({
      id: uniqueId(),
      loanValue: calcLoanValueWithProtocolFee(decimalLoanValue),
      hadoMarket: offer.hadoMarket,
      publicKey: offer.publicKey,
    })
  }

  return offers
}

interface HiddenNftsMintsState {
  mints: string[]
  add: (...mints: string[]) => void
}

export const useHiddenNftsMints = create<HiddenNftsMintsState>((set) => ({
  mints: [],
  add: (...mints) => {
    set(
      produce((state: HiddenNftsMintsState) => {
        state.mints.push(...mints)
      }),
    )
  },
}))
