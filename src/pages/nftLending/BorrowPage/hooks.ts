import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { produce } from 'immer'
import { chain, filter, groupBy, isEmpty, map, maxBy, sortBy, sumBy, uniqBy } from 'lodash'
import { create } from 'zustand'

import { core } from '@banx/api/nft'
import {
  isOfferNewer,
  isOptimisticLoanExpired,
  isOptimisticOfferExpired,
  useLoansOptimistic,
  useOffersOptimistic,
  useTokenType,
} from '@banx/store/nft'
import { convertLoanToBorrowNft } from '@banx/transactions/nftLending'
import {
  calcBorrowValueWithProtocolFee,
  calcBorrowValueWithRentFee,
  calculateLoanValue,
  convertOffersToSimple,
  isLoanActiveOrRefinanced,
  isLoanRepaid,
  isOfferClosed,
} from '@banx/utils'

import { BorrowTabName } from './BorrowPage'
import { useCartState } from './InstantLoansContent/cartState'
import { SimpleOffersByMarket } from './InstantLoansContent/types'

export const USE_BORROW_NFTS_V2_QUERY_KEY = 'walletBorrowNftsV2'

export const useBorrowNfts = () => {
  const { publicKey: walletPublicKey } = useWallet()
  const walletPubkeyString = walletPublicKey?.toBase58() || ''

  const { setCart } = useCartState()
  const { loans: optimisticLoans, remove: removeOptimisticLoans } = useLoansOptimistic()
  const { optimisticOffers, remove: removeOptimisticOffers } = useOffersOptimistic()

  const { tokenType } = useTokenType()

  const { data, isLoading, isFetched, isFetching } = useQuery(
    [USE_BORROW_NFTS_V2_QUERY_KEY, tokenType, walletPubkeyString],
    () => core.fetchBorrowNftsAndOffers({ walletPubkey: walletPubkeyString, tokenType }),
    {
      enabled: !!walletPublicKey,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
    },
  )

  //? Check expiredOffers and and purge them
  useEffect(() => {
    if (!data || isFetching || !isFetched || !walletPublicKey) return

    const expiredOffersByTime = filter(optimisticOffers, (offer) => isOptimisticOfferExpired(offer))

    const optimisticsToRemove = chain(optimisticOffers)
      //? Filter closed offers from LS optimistics
      .filter(({ offer }) => !isOfferClosed(offer?.pairState))
      .filter(({ offer }) => {
        const sameOfferFromBE = data.offers[offer.hadoMarket]?.find(
          ({ publicKey }) => publicKey === offer.publicKey,
        )
        //TODO Offer may exist from Lend page. Prevent purging
        if (!sameOfferFromBE && offer.assetReceiver === walletPublicKey.toBase58()) return false
        if (!sameOfferFromBE) return true
        const isBEOfferNewer = isOfferNewer(sameOfferFromBE, offer)
        return isBEOfferNewer
      })
      .value()

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

    const optimisticsFiltered = chain(optimisticOffers)
      //? Filter closed offers from LS optimistics
      .filter(({ offer }) => !isOfferClosed(offer?.pairState))
      //? Filter own offers from LS optimistics
      .filter(({ offer }) => offer?.assetReceiver !== walletPublicKey?.toBase58())
      .value()

    const optimisticsByMarket = groupBy(optimisticsFiltered, ({ offer }) => offer.hadoMarket)

    return chain(data.offers)
      .entries()
      .map(([marketPubkey, offers]) => {
        const nextOffers = offers.filter((offer) => {
          const sameOptimistic = optimisticsByMarket[offer.hadoMarket]?.find(
            ({ offer: optimisticOffer }) => optimisticOffer.publicKey === offer.publicKey,
          )
          if (!sameOptimistic) return true
          return isOfferNewer(offer, sameOptimistic.offer)
        })

        const optimisticsWithSameMarket =
          optimisticsByMarket[marketPubkey]?.map(({ offer }) => offer) || []

        const mergedOffers = sortBy(
          [...nextOffers, ...optimisticsWithSameMarket],
          calculateLoanValue,
        ).reverse()

        return [marketPubkey, mergedOffers]
      })
      .fromPairs()
      .value() as Record<string, core.Offer[]>
  }, [data, optimisticOffers, walletPublicKey])

  const simpleOffers = useMemo(() => {
    return Object.fromEntries(
      Object.entries(mergedRawOffers || {}).map(([marketPubkey, offers]) => {
        const simpleOffers = convertOffersToSimple(offers, 'desc')
        return [marketPubkey, simpleOffers]
      }),
    )
  }, [mergedRawOffers])

  const maxLoanValueByMarket: Record<string, number> = useMemo(() => {
    return chain(simpleOffers)
      .entries()
      .map(([hadoMarket, offers]) => {
        const bestOffer = maxBy(offers, ({ loanValue }) => loanValue)
        return [hadoMarket, bestOffer?.loanValue || 0]
      })
      .fromPairs()
      .value()
  }, [simpleOffers])

  //? Set offers in cartState
  useEffect(() => {
    if (!isEmpty(simpleOffers)) {
      setCart({ offersByMarket: simpleOffers })
    } else {
      setCart({ offersByMarket: {} })
    }
  }, [setCart, simpleOffers])

  const walletOptimisticLoans = useMemo(() => {
    if (!walletPublicKey) return []
    return optimisticLoans.filter(({ wallet }) => wallet === walletPublicKey?.toBase58())
  }, [optimisticLoans, walletPublicKey])

  const optimisticLoansActive = useMemo(() => {
    return walletOptimisticLoans.filter(({ loan }) => isLoanActiveOrRefinanced(loan))
  }, [walletOptimisticLoans])

  const optimisticLoansRepaid = useMemo(() => {
    return walletOptimisticLoans.filter(({ loan }) => isLoanRepaid(loan))
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
      .filter(({ loan }) => isLoanRepaid(loan))
      .map(({ loan }) => convertLoanToBorrowNft(loan))

    const optimisticLoansActiveMints = optimisticLoansActive.map(({ loan }) => loan.nft.mint)

    const filteredNfts = data.nfts.filter(({ mint }) => !optimisticLoansActiveMints.includes(mint))

    return uniqBy([...borrowNftsFromRepaid, ...filteredNfts], ({ mint }) => mint)
  }, [data, walletPublicKey, walletOptimisticLoans, optimisticLoansActive])

  const maxBorrow = useMemo(() => {
    return calcMaxBorrow(nfts, simpleOffers, tokenType)
  }, [nfts, simpleOffers, tokenType])

  return {
    nfts: nfts || [],
    rawOffers: mergedRawOffers || {},
    maxBorrow,
    isLoading,
    maxLoanValueByMarket,
  }
}

const calcMaxBorrow = (
  nfts: core.BorrowNft[],
  offers: SimpleOffersByMarket,
  tokenType: LendingTokenType,
) => {
  return chain(nfts)
    .countBy(({ loan }) => loan.marketPubkey)
    .entries()
    .reduce((maxBorrow, [marketPubkey, nftsAmount]) => {
      const maxBorrowMarket = sumBy(
        (offers[marketPubkey] || []).slice(0, nftsAmount),
        ({ loanValue, hadoMarket }) => {
          const loanValueWithProtocolFee = calcBorrowValueWithProtocolFee(loanValue)
          return calcBorrowValueWithRentFee(loanValueWithProtocolFee, hadoMarket, tokenType)
        },
      )

      return maxBorrow + maxBorrowMarket
    }, 0)
    .value()
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

type BorrowTabsState = {
  tab: BorrowTabName | null
  setTab: (tab: BorrowTabName | null) => void
}

export const useBorrowTabs = create<BorrowTabsState>((set) => ({
  tab: null,
  setTab: (tab) => set({ tab }),
}))
