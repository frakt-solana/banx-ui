import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { FraktBondState } from 'fbonds-core/lib/fbond-protocol/types'
import { produce } from 'immer'
import { countBy, filter, groupBy, isEmpty, map, sumBy, uniqBy, uniqueId } from 'lodash'
import { create } from 'zustand'

import { BorrowNft, Offer, fetchBorrowNftsAndOffers } from '@banx/api/core'
import {
  isOfferNewer,
  isOptimisticLoanExpired,
  isOptimisticOfferExpired,
  useLoansOptimistic,
  useOffersOptimistic,
} from '@banx/store'
import { convertLoanToBorrowNft } from '@banx/transactions'
import { calcLoanValueWithProtocolFee } from '@banx/utils'

import { useCartState } from './cartState'
import { SimpleOffer, SimpleOffersByMarket } from './types'

export const USE_BORROW_NFTS_QUERY_KEY = 'walletBorrowNfts'

export const useBorrowNfts = () => {
  const { setCart } = useCartState()
  const { loans: optimisticLoans, remove: removeOptimisticLoans } = useLoansOptimistic()
  const { optimisticOffers, remove: removeOptimisticOffers } = useOffersOptimistic()
  const { publicKey: walletPublicKey } = useWallet()

  const walletPubkeyString = walletPublicKey?.toBase58() || ''

  const { data, isLoading, isFetched, isFetching } = useQuery(
    [USE_BORROW_NFTS_QUERY_KEY, walletPubkeyString],
    () => fetchBorrowNftsAndOffers({ walletPubkey: walletPubkeyString }),
    {
      enabled: !!walletPublicKey,
      staleTime: 5 * 1000,
      refetchInterval: 15 * 1000,
      refetchOnWindowFocus: false,
    },
  )

  //? Check expiredOffers and and purge them
  useEffect(() => {
    if (!data || isFetching || !isFetched || !walletPublicKey) return

    const expiredOffersByTime = optimisticOffers.filter((offer) => isOptimisticOfferExpired(offer))

    const optimisticsToRemove = optimisticOffers.filter(({ offer }) => {
      const sameOfferFromBE = data.offers[offer.hadoMarket]?.find(
        ({ publicKey }) => publicKey === offer.publicKey,
      )
      if (!sameOfferFromBE) return true
      const isBEOfferNewer = isOfferNewer(sameOfferFromBE, offer)
      return isBEOfferNewer
    })

    if (optimisticsToRemove.length || expiredOffersByTime.length) {
      removeOptimisticOffers(
        map([...expiredOffersByTime, ...optimisticsToRemove], ({ offer }) => offer.publicKey),
      )
    }
  }, [data, isFetched, optimisticOffers, isFetching, walletPublicKey, removeOptimisticOffers])

  const mergedRawOffers = useMemo(() => {
    if (!data || !walletPublicKey) {
      return {}
    }

    const optimisticsByMarket = groupBy(optimisticOffers, ({ offer }) => offer.hadoMarket)

    return Object.fromEntries(
      Object.entries(data.offers).map(([marketPubkey, offers]) => {
        const nextOffers = offers.filter((offer) => {
          const sameOptimistic = optimisticsByMarket[offer.hadoMarket]?.find(
            ({ offer: optimisticOffer }) => optimisticOffer.publicKey === offer.publicKey,
          )
          if (!sameOptimistic) return true
          return isOfferNewer(offer, sameOptimistic.offer)
        })

        const optimisticsWithSameMarket =
          optimisticsByMarket[marketPubkey]?.map(({ offer }) => offer) || []

        return [marketPubkey, [...nextOffers, ...optimisticsWithSameMarket]]
      }),
    )
  }, [data, optimisticOffers, walletPublicKey])

  const simpleOffers = useMemo(() => {
    return Object.fromEntries(
      Object.entries(mergedRawOffers || {}).map(([marketPubkey, offers]) => {
        const simpleOffers = offers
          .map(spreadToSimpleOffers)
          .flat()
          .sort((a, b) => {
            return b.loanValue - a.loanValue
          })
        return [marketPubkey, simpleOffers]
      }),
    )
  }, [mergedRawOffers])

  //? Set offers in cartState
  useEffect(() => {
    if (!isEmpty(simpleOffers)) {
      setCart({ offersByMarket: simpleOffers })
    }
  }, [setCart, simpleOffers])

  const walletOptimisticLoans = useMemo(() => {
    if (!walletPublicKey) return []
    return optimisticLoans.filter(({ wallet }) => wallet === walletPublicKey?.toBase58())
  }, [optimisticLoans, walletPublicKey])

  const optimisticLoansActive = useMemo(() => {
    return walletOptimisticLoans.filter(
      ({ loan }) => loan.fraktBond.fraktBondState === FraktBondState.PerpetualActive,
    )
  }, [walletOptimisticLoans])

  const optimisticLoansRepaid = useMemo(() => {
    return walletOptimisticLoans.filter(
      ({ loan }) => loan.fraktBond.fraktBondState === FraktBondState.PerpetualRepaid,
    )
  }, [walletOptimisticLoans])

  //? Check expiredLoans or Repaid(duplicated from BE) and purge them
  useEffect(() => {
    if (!data || isFetching || !isFetched || !walletPublicKey) return

    const expiredLoans = walletOptimisticLoans.filter((loan) =>
      isOptimisticLoanExpired(loan, walletPublicKey.toBase58()),
    )

    const nftMintsFromBE = map(data.nfts, ({ mint }) => mint)

    const optimisticsToRemove = filter(optimisticLoansRepaid, ({ loan }) =>
      nftMintsFromBE.includes(loan.nft.mint),
    )

    if (optimisticsToRemove.length || expiredLoans.length) {
      removeOptimisticLoans(
        map([...expiredLoans, ...optimisticsToRemove], ({ loan }) => loan.publicKey),
        walletPublicKey.toBase58(),
      )
    }
  }, [
    data,
    isFetched,
    walletOptimisticLoans,
    removeOptimisticLoans,
    optimisticLoansRepaid,
    walletPublicKey,
    isFetching,
  ])

  //? Merge BE nfts with optimisticLoans
  const nfts = useMemo(() => {
    if (!data || !walletPublicKey) {
      return []
    }

    const borrowNftsFromRepaid = walletOptimisticLoans
      .filter(({ loan }) => loan.fraktBond.fraktBondState === FraktBondState.PerpetualRepaid)
      .map(({ loan }) => convertLoanToBorrowNft(loan))

    const optimisticLoansActiveMints = optimisticLoansActive.map(({ loan }) => loan.nft.mint)

    const filteredNfts = data.nfts.filter(({ mint }) => !optimisticLoansActiveMints.includes(mint))

    return uniqBy([...borrowNftsFromRepaid, ...filteredNfts], ({ mint }) => mint)
  }, [data, walletPublicKey, walletOptimisticLoans, optimisticLoansActive])

  const maxBorrow = useMemo(() => {
    return calcMaxBorrow(nfts, simpleOffers)
  }, [nfts, simpleOffers])

  return {
    nfts: nfts || [],
    rawOffers: mergedRawOffers || {},
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

export interface HiddenNftsMintsState {
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
