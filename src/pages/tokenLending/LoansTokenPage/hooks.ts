import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { chain, filter, groupBy, map } from 'lodash'
import moment from 'moment'
import { create } from 'zustand'

import { core } from '@banx/api/tokens'
import { SECONDS_IN_72_HOURS } from '@banx/constants'
import { useNftTokenType } from '@banx/store/nft'
import {
  isLoanNewer,
  isOfferNewer,
  isOptimisticLoanExpired,
  isOptimisticOfferExpired,
  useTokenLoansOptimistic,
  useTokenOffersOptimistic,
} from '@banx/store/token'
import { isOfferClosed, isTokenLoanRepaid, isTokenLoanTerminating } from '@banx/utils'

import { LoansTokenTabsName } from './LoansTokenPage'

export const USE_WALLET_TOKEN_LOANS_AND_OFFERS_QUERY_KEY = 'walletTokenLoansAndOffers'

export const useWalletTokenLoansAndOffers = () => {
  const { publicKey: walletPublicKey } = useWallet()
  const publicKeyString = walletPublicKey?.toBase58() || ''

  const { tokenType } = useNftTokenType()

  const { loans: optimisticLoans, remove: removeOptimisticLoans } = useTokenLoansOptimistic()

  const { data, isLoading, isFetched, isFetching } = useQuery(
    [USE_WALLET_TOKEN_LOANS_AND_OFFERS_QUERY_KEY, publicKeyString, tokenType],
    () => core.fetchWalletTokenLoansAndOffers({ walletPublicKey: publicKeyString, tokenType }),
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
      const sameLoanFromBE = (data?.loans || []).find(
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

    const dataFiltered = (data?.loans || []).filter(
      ({ publicKey }) => !optimisticLoansPubkeys.includes(publicKey),
    )

    const loans = dataFiltered.filter((loan) => !isTokenLoanRepaid(loan))

    return loans
  }, [data, walletOptimisticLoans])

  const filteredLiquidatedLoans = useMemo(() => {
    return loans.filter((loan) => {
      const { fraktBond } = loan

      const isTerminatingStatus = isTokenLoanTerminating(loan)

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
  } = useTokenOffersOptimistic()

  //? Check expiredOffers and and purge them
  useEffect(() => {
    if (!data || isFetching || !isFetched || !publicKeyString) return

    const expiredOffersByTime = filter(optimisticOffers, (offer) => isOptimisticOfferExpired(offer))

    const optimisticsToRemove = chain(optimisticOffers)
      //? Filter closed offers from LS optimistics
      .filter(({ offer }) => !isOfferClosed(offer?.pairState))
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
      .filter(({ offer }) => !isOfferClosed(offer?.pairState))
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

type LoansTokenTabsState = {
  tab: LoansTokenTabsName | null
  setTab: (tab: LoansTokenTabsName | null) => void
}

export const useLoansTokenTabs = create<LoansTokenTabsState>((set) => ({
  tab: null,
  setTab: (tab) => set({ tab }),
}))
