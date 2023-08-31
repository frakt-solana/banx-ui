import { useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { produce } from 'immer'
import { chain, maxBy } from 'lodash'
import { create } from 'zustand'

import { Loan, Offer, fetchLenderLoansAndOffers } from '@banx/api/core'

interface HiddenNftsMintsState {
  mints: string[]
  addMints: (...mints: string[]) => void
}

const useHiddenNftsMints = create<HiddenNftsMintsState>((set) => ({
  mints: [],
  addMints: (...mints) => {
    set(
      produce((state: HiddenNftsMintsState) => {
        state.mints.push(...mints)
      }),
    )
  },
}))

interface OptimisticLenderLoansState {
  loans: Loan[]
  add: (loan: Loan) => void
  find: (loanPubkey: string) => Loan | null
  update: (loan: Loan) => void
}

const useLenderLoansOptimistic = create<OptimisticLenderLoansState>((set, get) => ({
  loans: [],
  add: (loan) => {
    set(
      produce((state: OptimisticLenderLoansState) => {
        state.loans.push(loan)
      }),
    )
  },
  find: (loanPubkey) => {
    return get().loans.find(({ publicKey }) => publicKey === loanPubkey) ?? null
  },
  update: (loan) => {
    const loanExists = !!get().find(loan.publicKey)

    loanExists &&
      set(
        produce((state: OptimisticLenderLoansState) => {
          state.loans = state.loans.map((existingLoan) =>
            existingLoan.publicKey === loan.publicKey ? loan : existingLoan,
          )
        }),
      )
  },
}))

interface OptimisticOffersState {
  offers: Offer[]
  addOffer: (offer: Offer) => void
  findOffer: (offerPubkey: string) => Offer | null
  updateOffer: (offer: Offer) => void
}

const useOptimisticOffers = create<OptimisticOffersState>((set, get) => ({
  offers: [],
  addOffer: (offer) => {
    set(
      produce((state: OptimisticOffersState) => {
        state.offers.push(offer)
      }),
    )
  },
  findOffer: (offerPubkey) => {
    const { offers } = get()
    return offers.find(({ publicKey }) => publicKey === offerPubkey) ?? null
  },
  updateOffer: (offer: Offer) => {
    const { findOffer } = get()
    const offerExists = !!findOffer(offer.publicKey)

    offerExists &&
      set(
        produce((state: OptimisticOffersState) => {
          state.offers = state.offers.map((existingOffer) =>
            existingOffer.publicKey === offer.publicKey ? offer : existingOffer,
          )
        }),
      )
  },
}))

export const useLenderLoansAndOffers = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { mints, addMints } = useHiddenNftsMints()

  const { loans: optimisticLoans, add, find, update } = useLenderLoansOptimistic()
  const { offers: optimisticOffers, findOffer, updateOffer, addOffer } = useOptimisticOffers()

  const { data, isLoading } = useQuery(
    ['lenderLoans', publicKeyString],
    () => fetchLenderLoansAndOffers({ walletPublicKey: publicKeyString }),
    {
      enabled: !!publicKeyString,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  const loans = useMemo(() => {
    if (!data?.nfts) {
      return []
    }

    const combinedLoans = [...data.nfts, ...optimisticLoans]

    const filteredLoans = chain(combinedLoans)
      .groupBy('publicKey')
      .map((offers) => maxBy(offers, 'fraktBond.lastTransactedAt'))
      .compact()
      .value()

    return filteredLoans.filter(({ nft }) => !mints.includes(nft.mint))
  }, [data, mints, optimisticLoans])

  const updateOrAddLoan = (loan: Loan) => {
    const loanExists = !!find(loan.publicKey)
    return loanExists ? update(loan) : add(loan)
  }

  const updateOrAddOffer = (offer: Offer) => {
    const loanExists = !!findOffer(offer.publicKey)
    return loanExists ? updateOffer(offer) : addOffer(offer)
  }

  return {
    loans,
    offers: data?.offers ?? {},
    loading: isLoading,
    optimisticOffers,
    updateOrAddOffer,
    updateOrAddLoan,
    addMints,
  }
}
