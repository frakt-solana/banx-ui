import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { FraktBondState } from 'fbonds-core/lib/fbond-protocol/types'
import { produce } from 'immer'
import { countBy, filter, isEmpty, map, sumBy, uniqBy, uniqueId } from 'lodash'
import { create } from 'zustand'

import { BorrowNft, Offer, fetchBorrowNftsAndOffers } from '@banx/api/core'
import { isExpired, useOptimisticLoans } from '@banx/store'
import { convertLoanToBorrowNft } from '@banx/transactions'
import { calcLoanValueWithProtocolFee } from '@banx/utils'

import { useCartState } from './cartState'
import { SimpleOffer, SimpleOffersByMarket } from './types'

export const USE_BORROW_NFTS_QUERY_KEY = 'walletBorrowNfts'

export const useBorrowNfts = () => {
  const { setCart } = useCartState()
  const { loans: optimisticLoans, remove: removeOptimisticLoans } = useOptimisticLoans()

  const { publicKey: walletPublicKey } = useWallet()

  const walletPubkeyString = walletPublicKey?.toBase58() || ''

  const { data, isLoading, isFetched, isFetching } = useQuery(
    [USE_BORROW_NFTS_QUERY_KEY, walletPubkeyString],
    () => fetchBorrowNftsAndOffers({ walletPubkey: walletPubkeyString }),
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
      isExpired(loan, walletPublicKey.toBase58()),
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
    return calcMaxBorrow(nfts, offers)
  }, [nfts, offers])

  return {
    nfts: nfts || [],
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
