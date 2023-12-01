import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { PairState } from 'fbonds-core/lib/fbond-protocol/types'
import { produce } from 'immer'
import { chain, map, maxBy } from 'lodash'
import { create } from 'zustand'

import { LendLoansAndOffers, Loan, Offer, fetchLenderLoansAndOffers } from '@banx/api/core'
import { fetchUserOffersStats } from '@banx/api/stats'
import { isOfferNewer, isOptimisticOfferExpired, useOffersOptimistic } from '@banx/store'

import { useMarketsPreview } from '../LendPage/hooks'

interface HiddenNftsMintsState {
  mints: string[]
  addMints: (...mints: string[]) => void
}

export const useHiddenNftsMints = create<HiddenNftsMintsState>((set) => ({
  mints: [],
  addMints: (...mints) =>
    set(
      produce((state: HiddenNftsMintsState) => {
        state.mints.push(...mints)
      }),
    ),
}))

const convertLoanToOptimistic = (loan: Loan, walletPublicKey: string) => {
  return {
    loan,
    wallet: walletPublicKey,
  }
}

export interface LoanOptimistic {
  loan: Loan
  wallet: string
}

interface OptimisticLenderLoansState {
  loans: LoanOptimistic[]
  addLoans: (loan: Loan, walletPublicKey: string) => void
  findLoans: (loanPubkey: string, walletPublicKey: string) => LoanOptimistic | null
  updateLoans: (loan: Loan, walletPublicKey: string) => void
}

const useLenderLoansOptimistic = create<OptimisticLenderLoansState>((set, get) => ({
  loans: [],
  addLoans: (loan, walletPublicKey) => {
    if (!walletPublicKey) return

    return set(
      produce((state: OptimisticLenderLoansState) => {
        state.loans.push(convertLoanToOptimistic(loan, walletPublicKey))
      }),
    )
  },
  findLoans: (loanPubkey, walletPublicKey) => {
    if (!walletPublicKey) return null

    return get().loans.find(({ loan }) => loan.publicKey === loanPubkey) ?? null
  },
  updateLoans: (loan, walletPublicKey) => {
    if (!walletPublicKey) return

    const loanExists = !!get().findLoans(loan.publicKey, walletPublicKey)

    loanExists &&
      set(
        produce((state: OptimisticLenderLoansState) => {
          state.loans = state.loans.map((existingLoan) =>
            existingLoan.loan.publicKey === loan.publicKey
              ? convertLoanToOptimistic(loan, walletPublicKey)
              : existingLoan,
          )
        }),
      )
  },
}))

export const USE_LENDER_LOANS_AND_OFFERS_QUERY_KEY = 'userOffersV2'

export const useLenderLoansAndOffers = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { mints, addMints } = useHiddenNftsMints()

  const { loans: optimisticLoans, addLoans, findLoans, updateLoans } = useLenderLoansOptimistic()
  const { optimisticOffers, remove: removeOffers, update: updateOrAddOffer } = useOffersOptimistic()

  const { marketsPreview } = useMarketsPreview()

  const { data, isLoading, isFetching, isFetched } = useQuery(
    [USE_LENDER_LOANS_AND_OFFERS_QUERY_KEY, publicKeyString],
    () => fetchLenderLoansAndOffers({ walletPublicKey: publicKeyString }),
    {
      enabled: !!publicKeyString,
      refetchOnWindowFocus: false,
      refetchInterval: 30 * 1000,
    },
  )

  //? Check expiredOffers and and purge them
  useEffect(() => {
    const userOffers = (data ?? []).map(({ offer }) => offer)

    if (!userOffers || isFetching || !isFetched) return

    const expiredOffersByTime = optimisticOffers.filter((offer) => isOptimisticOfferExpired(offer))

    const optimisticsToRemove = chain(optimisticOffers)
      .filter(({ offer }) => offer?.pairState !== PairState.PerpetualClosed)
      .filter(({ offer }) => offer?.pairState !== PairState.PerpetualBondingCurveClosed)
      .filter(({ offer }) => {
        const sameOfferFromBE = userOffers?.find(({ publicKey }) => publicKey === offer.publicKey)
        if (!sameOfferFromBE) return false
        const isBEOfferNewer = isOfferNewer(sameOfferFromBE as Offer, offer)
        return isBEOfferNewer
      })
      .value()

    if (optimisticsToRemove.length || expiredOffersByTime.length) {
      removeOffers(
        map([...expiredOffersByTime, ...optimisticsToRemove], ({ offer }) => offer.publicKey),
      )
    }
  }, [data, isFetching, isFetched, optimisticOffers, removeOffers])

  const walletOptimisticLoans = useMemo(() => {
    if (!publicKeyString) return []
    return optimisticLoans.filter(({ wallet }) => wallet === publicKeyString)
  }, [optimisticLoans, publicKeyString])

  const offers = useMemo(() => {
    const userOffers = (data ?? []).map(({ offer }) => offer)

    if (!userOffers || !optimisticOffers) return []

    const optimisticUserOffers: Offer[] = optimisticOffers
      .map(({ offer }) => offer)
      .filter(({ assetReceiver }) => assetReceiver === publicKey?.toBase58())

    const combinedOffers = [...optimisticUserOffers, ...userOffers]

    return chain(combinedOffers)
      .groupBy(({ publicKey }) => publicKey)
      .map((offers) => maxBy(offers, ({ lastTransactedAt }) => lastTransactedAt))
      .compact()
      .value()
  }, [data, optimisticOffers, publicKey])

  const processedData = useMemo(() => {
    if (!data?.length) return []

    const getLoans = (item: LendLoansAndOffers) => {
      const combinedLoans = [...item.loans, ...walletOptimisticLoans.map(({ loan }) => loan)]
      return chain(combinedLoans)
        .groupBy('publicKey')
        .map((offers) => maxBy(offers, ({ fraktBond }) => fraktBond.lastTransactedAt))
        .compact()
        .filter((loan) => !mints.includes(loan.nft.mint))
        .value()
    }

    const getOffer = (item: LendLoansAndOffers) =>
      offers.find(({ publicKey }) => publicKey === item.offer.publicKey) || item.offer

    const updatedData = data.map((item) => ({
      ...item,
      offer: getOffer(item),
      loans: getLoans(item),
    }))

    //? Add missing offers
    offers.forEach((offer) => {
      if (!updatedData.find((item) => item.offer.publicKey === offer.publicKey)) {
        const {
          collectionName = '',
          collectionImage = '',
          collectionFloor = 0,
        } = marketsPreview.find(({ marketPubkey }) => marketPubkey === offer.hadoMarket) ?? {}

        updatedData.push({
          loans: [],
          collectionMeta: { collectionName, collectionImage, collectionFloor },
          offer,
        })
      }
    })
    return updatedData.filter(({ offer, loans }) => !isClosedAndEmptyOffer(offer, loans))
  }, [data, mints, offers, walletOptimisticLoans, marketsPreview])

  const updateOrAddLoan = (loan: Loan) => {
    const loanExists = !!findLoans(loan.publicKey, publicKeyString)
    return loanExists ? updateLoans(loan, publicKeyString) : addLoans(loan, publicKeyString)
  }

  return {
    data: processedData,
    offers: processedData.map(({ offer }) => offer),
    loading: isLoading,
    optimisticOffers,
    updateOrAddOffer,
    updateOrAddLoan,
    addMints,
  }
}

const isClosedAndEmptyOffer = (offer: Offer, loans: Loan[]) => {
  const isClosedOffer =
    offer.pairState === PairState.PerpetualClosed ||
    offer.pairState === PairState.PerpetualBondingCurveClosed

  return isClosedOffer && !loans.length
}

export const useUserOffersStats = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { data, isLoading } = useQuery(
    ['userOffersStats', publicKeyString],
    () => fetchUserOffersStats(publicKeyString),
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
