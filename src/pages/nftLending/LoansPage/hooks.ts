import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { chain, filter, groupBy, map } from 'lodash'
import moment from 'moment'
import { create } from 'zustand'

import { core, stats } from '@banx/api/nft'
import { useTokenType } from '@banx/store/common'
import {
  isLoanNewer,
  isOfferNewer,
  isOptimisticLoanExpired,
  isOptimisticOfferExpired,
  purgeLoansWithSameMintByFreshness,
  useLoansOptimistic,
  useLoansRequestsOptimistic,
  useOffersOptimistic,
} from '@banx/store/nft'
import { isLoanListed, isLoanRepaid, isLoanTerminating, isOfferStateClosed } from '@banx/utils'

import { LoansTabsNames, SECONDS_IN_72_HOURS } from './constants'

export const USE_WALLET_LOANS_AND_OFFERS_QUERY_KEY = 'walletLoansAndOffers'

export const useWalletLoansAndOffers = () => {
  const { publicKey: walletPublicKey } = useWallet()
  const publicKeyString = walletPublicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

  const { loans: optimisticLoans, remove: removeOptimisticLoans } = useLoansOptimistic()

  const { data, isLoading, isFetched, isFetching } = useQuery(
    [USE_WALLET_LOANS_AND_OFFERS_QUERY_KEY, publicKeyString, tokenType],
    () => core.fetchWalletLoansAndOffers({ walletPublicKey: publicKeyString, tokenType }),
    {
      enabled: !!publicKeyString,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 5 * 60 * 1000, //? 5 minutes
    },
  )

  const walletOptimisticLoans = useMemo(() => {
    if (!publicKeyString) return []
    return optimisticLoans.filter(({ wallet }) => wallet === publicKeyString)
  }, [optimisticLoans, publicKeyString])

  //? Check same active loans (duplicated with BE) and purge them
  useEffect(() => {
    if (!data || isFetching || !isFetched || !publicKeyString) return

    const expiredLoans = walletOptimisticLoans.filter((loan) =>
      isOptimisticLoanExpired(loan, publicKeyString),
    )

    const optimisticsToRemove = walletOptimisticLoans.filter(({ loan }) => {
      const sameLoanFromBE = (data?.nfts || []).find(
        ({ publicKey }) => publicKey === loan.publicKey,
      )
      if (!sameLoanFromBE) return false
      const isBELoanNewer = isLoanNewer(sameLoanFromBE, loan)
      return isBELoanNewer
    })

    if (optimisticsToRemove.length || expiredLoans.length) {
      removeOptimisticLoans(
        map([...expiredLoans, ...optimisticsToRemove], ({ loan }) => loan.publicKey),
        publicKeyString,
      )
    }
  }, [data, isFetched, publicKeyString, walletOptimisticLoans, removeOptimisticLoans, isFetching])

  const loans = useMemo(() => {
    if (!data) {
      return []
    }

    const optimisticLoansPubkeys = walletOptimisticLoans.map(({ loan }) => loan.publicKey)

    const dataFiltered = (data?.nfts || []).filter(
      ({ publicKey }) => !optimisticLoansPubkeys.includes(publicKey),
    )

    const purgedSameMint = purgeLoansWithSameMintByFreshness(
      [...dataFiltered, ...map(walletOptimisticLoans, ({ loan }) => loan)],
      (loan) => loan,
    )

    const loans = purgedSameMint.filter((loan) => !isLoanRepaid(loan))

    return loans
  }, [data, walletOptimisticLoans])

  const filteredLiquidatedLoans = useMemo(() => {
    return loans.filter((loan) => {
      const { fraktBond } = loan

      const isTerminatingStatus = isLoanTerminating(loan)

      if (isTerminatingStatus) {
        const currentTimeInSeconds = moment().unix()
        const expiredAt = fraktBond.refinanceAuctionStartedAt + SECONDS_IN_72_HOURS
        return currentTimeInSeconds < expiredAt
      }

      return loan
    })
  }, [loans])

  const {
    optimisticOffers,
    remove: removeOptimisticOffers,
    update: updateOptimisticOffers,
  } = useOffersOptimistic()

  //? Check expiredOffers and and purge them
  useEffect(() => {
    if (!data || isFetching || !isFetched || !publicKeyString) return

    const expiredOffersByTime = filter(optimisticOffers, (offer) => isOptimisticOfferExpired(offer))

    const optimisticsToRemove = chain(optimisticOffers)
      //? Filter closed offers from LS optimistics
      .filter(({ offer }) => !isOfferStateClosed(offer?.pairState))
      .filter(({ offer }) => {
        const sameOfferFromBE = data.offers[offer.hadoMarket]?.find(
          ({ publicKey }) => publicKey === offer.publicKey,
        )
        //TODO Offer may exist from Lend page. Prevent purging
        if (!sameOfferFromBE && offer.assetReceiver === publicKeyString) return false
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
  }, [data, isFetched, optimisticOffers, isFetching, publicKeyString, removeOptimisticOffers])

  const mergedRawOffers = useMemo(() => {
    if (!data || !publicKeyString) {
      return {}
    }

    const optimisticsFiltered = chain(optimisticOffers)
      //? Filter closed offers from LS optimistics
      .filter(({ offer }) => !isOfferStateClosed(offer?.pairState))
      //? Filter own offers from LS optimistics
      .filter(({ offer }) => offer?.assetReceiver !== publicKeyString)
      .value()

    const optimisticsByMarket = groupBy(optimisticsFiltered, ({ offer }) => offer.hadoMarket)

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
  }, [data, optimisticOffers, publicKeyString])

  return {
    loans: filteredLiquidatedLoans,
    offers: mergedRawOffers,
    updateOptimisticOffers,
    removeOptimisticOffers,
    isLoading,
  }
}

export const useUserLoansStats = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

  const { data, isLoading } = useQuery(
    ['userLoansStats', publicKeyString, tokenType],
    () =>
      stats.fetchUserLoansStats({
        walletPubkey: publicKeyString,
        marketType: tokenType,
        tokenType: 'nft',
      }),
    {
      enabled: !!publicKeyString,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  return {
    data,
    isLoading,
  }
}

export const USE_BORROWER_LOANS_REQUESTS_QUERY_KEY = 'borrowerLoansRequests'

export const useBorrowerLoansRequests = () => {
  const { publicKey: walletPublicKey } = useWallet()
  const publicKeyString = walletPublicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

  const { loans: optimisticLoans, remove: removeOptimisticLoans } = useLoansRequestsOptimistic()

  const { data, isLoading, isFetched, isFetching } = useQuery(
    [USE_BORROWER_LOANS_REQUESTS_QUERY_KEY, walletPublicKey, tokenType],
    () => core.fetchBorrowerLoansRequests({ walletPublicKey: publicKeyString, tokenType }),
    {
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  const walletOptimisticLoans = useMemo(() => {
    if (!publicKeyString) return []
    return optimisticLoans.filter(({ wallet }) => wallet === publicKeyString)
  }, [optimisticLoans, publicKeyString])

  //? Check same active loans (duplicated with BE) and purge them
  useEffect(() => {
    if (!data || isFetching || !isFetched || !publicKeyString) return

    const expiredLoans = walletOptimisticLoans.filter((loan) =>
      isOptimisticLoanExpired(loan, publicKeyString),
    )

    const optimisticsToRemove = walletOptimisticLoans.filter(({ loan }) => {
      const sameLoanFromBE = (data || []).find(({ publicKey }) => publicKey === loan.publicKey)
      if (!sameLoanFromBE) return false
      const isBELoanNewer = isLoanNewer(sameLoanFromBE, loan)
      return isBELoanNewer
    })

    if (optimisticsToRemove.length || expiredLoans.length) {
      removeOptimisticLoans(
        map([...expiredLoans, ...optimisticsToRemove], ({ loan }) => loan.publicKey),
        publicKeyString,
      )
    }
  }, [data, isFetched, publicKeyString, walletOptimisticLoans, removeOptimisticLoans, isFetching])

  const loans = useMemo(() => {
    if (!data) {
      return []
    }

    const optimisticLoansPubkeys = walletOptimisticLoans.map(({ loan }) => loan.publicKey)

    const dataFiltered = (data || []).filter(
      ({ publicKey }) => !optimisticLoansPubkeys.includes(publicKey),
    )

    const purgedSameMint = purgeLoansWithSameMintByFreshness(
      [...dataFiltered, ...map(walletOptimisticLoans, ({ loan }) => loan)],
      (loan) => loan,
    )

    const loans = purgedSameMint.filter((loan) => !isLoanRepaid(loan))

    return loans
  }, [data, walletOptimisticLoans])

  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => isLoanListed(loan))
  }, [loans])

  return {
    loans: filteredLoans,
    isLoading,
  }
}

type LoansTabsState = {
  tab: LoansTabsNames | null
  setTab: (tab: LoansTabsNames | null) => void
}

export const useLoansTabs = create<LoansTabsState>((set) => ({
  tab: null,
  setTab: (tab) => set({ tab }),
}))
